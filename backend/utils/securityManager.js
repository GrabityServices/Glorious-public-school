
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

// Serialize writes within this Node.js process.
const queues = new Map();

async function withFile(file, operation) {
  const previous = queues.get(file) || Promise.resolve();

  const current = previous.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });

    let data = {};

    try {
      data = JSON.parse(await fs.readFile(file, "utf8"));
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

// Normalize IP addresses consistently.
function normalizeIP(ip) {
  if (!ip || typeof ip !== "string") return "unknown";

  let value = ip.trim();

  if (value.startsWith("::ffff:")) {
    value = value.substring(7);
  }

  if (value === "::1") {
    value = "127.0.0.1";
  }

  return value;
}

function getIPKey(ip) {
  const normalized = normalizeIP(ip);

  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}

// CHECK IP BLOCK
async function checkIPAllowed(ip) {
  const key = getIPKey(ip);
  const now = Date.now();

  return withFile(FILES.attempts, (data) => {
    const record = data[key];

    if (!record) {
      return { blocked: false };
    }

    if (record.blockedUntil > now) {
      return {
        blocked: true,
        until: record.blockedUntil,
        attempts: record.count,
      };
    }

    // Expired block: reset the IP counter.
    if (record.blockedUntil && record.blockedUntil <= now) {
      delete data[key];
      return { blocked: false };
    }

    return { blocked: false };
  });
}

// RECORD FAILED LOGIN OR PASSWORD VERIFICATION
async function recordFailedAttempt(ip) {
  const key = getIPKey(ip);
  const now = Date.now();

  return withFile(FILES.attempts, (data) => {
    let record = data[key];

    if (
      !record ||
      now - record.firstAttemptAt >= BLOCK_DURATION
    ) {
      record = {
        count: 0,
        firstAttemptAt: now,
        lastAttemptAt: now,
        blockedUntil: 0,
      };
    }

    record.count++;
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

// SUCCESSFUL AUTHENTICATION
async function recordSuccessfulAttempt(ip) {
  const key = getIPKey(ip);

  await withFile(FILES.attempts, (data) => {
    // A successful authentication resets this IP's counter.
    delete data[key];
  });
}

// WEEKLY PASSWORD CHANGE LIMIT
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

// ROLLBACK PASSWORD CHANGE RESERVATION
async function cancelPasswordChange(adminId, timestamp) {
  if (!Number.isFinite(timestamp)) return;

  const key = String(adminId);

  await withFile(FILES.passwords, (history) => {
    const entries = history[key] || [];
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

// CLEAN EXPIRED DATA
async function cleanupSecurityData() {
  const now = Date.now();

  await withFile(FILES.attempts, (data) => {
    for (const [key, record] of Object.entries(data)) {
      if (
        !record ||
        (record.blockedUntil && record.blockedUntil <= now) ||
        (
          !record.blockedUntil &&
          now - record.lastAttemptAt >= BLOCK_DURATION
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
