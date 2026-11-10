
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const DATA_DIR = path.join(__dirname, "../data/security");

const FILES = {
  attempts: path.join(DATA_DIR, "ip-security.json"),
  passwords: path.join(DATA_DIR, "password-history.json"),
};

const ATTEMPT_LIMIT = 5;
const BLOCK_DURATION = 12 * 60 * 60 * 1000;
const PASSWORD_WINDOW = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_LIMIT = 2;

// Serialize file operations inside this Node.js process.
const queues = new Map();

async function withFile(file, operation) {
  const previous = queues.get(file) || Promise.resolve();

  const current = previous.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });

    let data = {};

    try {
      data = JSON.parse(await fs.readFile(file, "utf8"));

      if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new Error(`Invalid security data format: ${file}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }

    const result = await operation(data);
    const tempFile = `${file}.${crypto.randomUUID()}.tmp`;

    try {
      await fs.writeFile(
        tempFile,
        JSON.stringify(data, null, 2),
        "utf8"
      );

      await fs.rename(tempFile, file);
    } catch (error) {
      await fs.rm(tempFile, { force: true }).catch(() => {});
      throw error;
    }

    return result;
  });

  queues.set(file, current.catch(() => {}));

  return current;
}

function normalizeIP(ip) {
  if (!ip || typeof ip !== "string") return "unknown";

  let value = ip.trim();

  // Remove IPv4-mapped IPv6 prefix.
  if (value.toLowerCase().startsWith("::ffff:")) {
    value = value.substring(7);
  }

  if (value === "::1") {
    value = "127.0.0.1";
  }

  return value;
}

function getIPKey(ip) {
  return crypto
    .createHash("sha256")
    .update(normalizeIP(ip))
    .digest("hex");
}

// Check the shared IP block.
async function checkIPAllowed(ip) {
  const key = getIPKey(ip);
  const now = Date.now();

  return withFile(FILES.attempts, (data) => {
    const record = data[key];

    if (!record) {
      return { blocked: false, attempts: 0 };
    }

    if (
      Number(record.blockedUntil) > now
    ) {
      return {
        blocked: true,
        attempts: Number(record.count) || ATTEMPT_LIMIT,
        until: Number(record.blockedUntil),
      };
    }

    // Remove expired block or stale attempt record.
    if (
      (record.blockedUntil && record.blockedUntil <= now) ||
      (
        !record.blockedUntil &&
        now - Number(record.lastAttemptAt || 0) >= BLOCK_DURATION
      )
    ) {
      delete data[key];
    }

    return { blocked: false, attempts: 0 };
  });
}

// Record a failed login OR incorrect current password.
async function recordFailedAttempt(ip) {
  const key = getIPKey(ip);
  const now = Date.now();

  return withFile(FILES.attempts, (data) => {
    let record = data[key];

    // Never reset or extend an existing active block.
    if (record && Number(record.blockedUntil) > now) {
      return {
        attempts: Number(record.count) || ATTEMPT_LIMIT,
        blocked: true,
        until: Number(record.blockedUntil),
      };
    }

    // Start a fresh attempt window when the previous one expires.
    if (
      !record ||
      !record.firstAttemptAt ||
      now - Number(record.firstAttemptAt) >= BLOCK_DURATION
    ) {
      record = {
        count: 0,
        firstAttemptAt: now,
        lastAttemptAt: now,
        blockedUntil: 0,
      };
    }

    record.count = (Number(record.count) || 0) + 1;
    record.lastAttemptAt = now;

    if (record.count >= ATTEMPT_LIMIT) {
      record.blockedUntil = now + BLOCK_DURATION;
    }

    data[key] = record;

    return {
      attempts: record.count,
      blocked: record.blockedUntil > now,
      until: record.blockedUntil || null,
    };
  });
}

// Successful authentication clears only an unblocked IP's failures.
// An active block can NEVER be cleared by knowing the correct password.
async function recordSuccessfulAttempt(ip) {
  const key = getIPKey(ip);
  const now = Date.now();

  return withFile(FILES.attempts, (data) => {
    const record = data[key];

    if (record && Number(record.blockedUntil) > now) {
      return {
        blocked: true,
        until: Number(record.blockedUntil),
      };
    }

    delete data[key];

    return { blocked: false };
  });
}

// Maximum 2 password changes in 7 days per admin.
async function reservePasswordChange(adminId) {
  const now = Date.now();
  const key = String(adminId);

  return withFile(FILES.passwords, (history) => {
    const previous = Array.isArray(history[key])
      ? history[key]
      : [];

    const recent = previous.filter(
      timestamp =>
        Number.isFinite(timestamp) &&
        timestamp > now - PASSWORD_WINDOW
    );

    if (recent.length >= PASSWORD_LIMIT) {
      history[key] = recent;

      return {
        allowed: false,
        nextAllowedAt: recent[0] + PASSWORD_WINDOW,
      };
    }

    recent.push(now);
    history[key] = recent;

    return {
      allowed: true,
      timestamp: now,
    };
  });
}

async function cancelPasswordChange(adminId, timestamp) {
  if (!Number.isFinite(timestamp)) return;

  const key = String(adminId);

  await withFile(FILES.passwords, (history) => {
    const entries = Array.isArray(history[key])
      ? history[key]
      : [];

    const index = entries.lastIndexOf(timestamp);

    if (index !== -1) {
      entries.splice(index, 1);
    }

    if (entries.length) {
      history[key] = entries;
    } else {
      delete history[key];
    }
  });
}

// Remove expired security records.
async function cleanupSecurityData() {
  const now = Date.now();

  await withFile(FILES.attempts, (data) => {
    for (const [key, record] of Object.entries(data)) {
      if (
        !record ||
        (
          record.blockedUntil &&
          Number(record.blockedUntil) <= now
        ) ||
        (
          !record.blockedUntil &&
          now - Number(record.lastAttemptAt || 0) >= BLOCK_DURATION
        )
      ) {
        delete data[key];
      }
    }
  });

  await withFile(FILES.passwords, (history) => {
    for (const [key, entries] of Object.entries(history)) {
      const recent = (
        Array.isArray(entries) ? entries : []
      ).filter(
        timestamp =>
          Number.isFinite(timestamp) &&
          timestamp > now - PASSWORD_WINDOW
      );

      if (recent.length) {
        history[key] = recent;
      } else {
        delete history[key];
      }
    }
  });

  console.log("[Security] IP security cleanup completed.");
}

module.exports = {
  normalizeIP,
  checkIPAllowed,
  recordFailedAttempt,
  recordSuccessfulAttempt,
  reservePasswordChange,
  cancelPasswordChange,
  cleanupSecurityData,
};
