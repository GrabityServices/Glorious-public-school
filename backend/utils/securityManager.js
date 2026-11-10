
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_DIR = path.join(__dirname, "../data/security");

const FILES = {
  attempts: path.join(DATA_DIR, "login-attempts.json"),
  blocked: path.join(DATA_DIR, "blocked-users.json"),
  devices: path.join(DATA_DIR, "devices.json"),
  passwords: path.join(DATA_DIR, "password-history.json"),
};

const DEVICE_LIFETIME = 24 * 60 * 60 * 1000;
const BLOCK_DURATION = 12 * 60 * 60 * 1000;
const ATTEMPT_LIMIT = 5;
const PASSWORD_WINDOW = 7 * 24 * 60 * 60 * 1000;
const PASSWORD_LIMIT = 2;

// Serialize operations per file to avoid concurrent writes.
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
      await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
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

function accountKey(identifier) {
  return crypto
    .createHash("sha256")
    .update(String(identifier).trim().toLowerCase())
    .digest("hex");
}

// DEVICE MANAGEMENT

export async function getDeviceId(req, res) {
  const existingId = req.cookies?.admin_device;
  const now = Date.now();

  const device = await withFile(FILES.devices, (devices) => {
    let record = existingId && devices[existingId];

    if (
      record &&
      record.expiresAt > now &&
      record.issuedAt <= now
    ) {
      return {
        id: existingId,
        expiresAt: record.expiresAt,
      };
    }

    if (existingId) {
      delete devices[existingId];
    }

    const id = crypto.randomUUID();

    devices[id] = {
      issuedAt: now,
      expiresAt: now + DEVICE_LIFETIME,
    };

    return {
      id,
      expiresAt: devices[id].expiresAt,
    };
  });

  res.cookie("admin_device", device.id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: Math.max(0, device.expiresAt - now),
  });

  return device.id;
}

// CHECK LOGIN BLOCK

export async function checkLoginAllowed(identifier, deviceId) {
  const account = accountKey(identifier);
  const now = Date.now();

  return withFile(FILES.blocked, (blocked) => {
    const accountBlock = blocked[`account:${account}`];
    const deviceBlock = blocked[`device:${deviceId}`];

    if (accountBlock?.expiresAt > now) {
      return {
        blocked: true,
        until: accountBlock.expiresAt,
      };
    }

    if (deviceBlock?.expiresAt > now) {
      return {
        blocked: true,
        until: deviceBlock.expiresAt,
      };
    }

    return { blocked: false };
  });
}

// RECORD FAILED PASSWORD

export async function recordFailedLogin(identifier, deviceId) {
  const account = accountKey(identifier);
  const now = Date.now();

  return withFile(FILES.attempts, async (attempts) => {
    const keys = [
      `account:${account}`,
      `device:${deviceId}`,
    ];

    let highestAttempts = 0;

    for (const key of keys) {
      let record = attempts[key];

      if (!record || now - record.firstAttemptAt >= BLOCK_DURATION) {
        record = {
          count: 0,
          firstAttemptAt: now,
        };
      }

      record.count++;
      record.lastAttemptAt = now;

      attempts[key] = record;
      highestAttempts = Math.max(highestAttempts, record.count);
    }

    if (highestAttempts >= ATTEMPT_LIMIT) {
      await withFile(FILES.blocked, (blocked) => {
        const expiresAt = now + BLOCK_DURATION;

        blocked[`account:${account}`] = {
          blockedAt: now,
          expiresAt,
          reason: "5 failed login attempts",
        };

        blocked[`device:${deviceId}`] = {
          blockedAt: now,
          expiresAt,
          reason: "5 failed login attempts",
        };
      });
    }

    return {
      attempts: highestAttempts,
      blocked: highestAttempts >= ATTEMPT_LIMIT,
    };
  });
}

// RECORD SUCCESSFUL LOGIN

export async function recordSuccessfulLogin(identifier, deviceId) {
  const account = accountKey(identifier);

  await withFile(FILES.attempts, (attempts) => {
    delete attempts[`account:${account}`];
    delete attempts[`device:${deviceId}`];
  });
}

// PASSWORD CHANGE LIMIT

export async function reservePasswordChange(adminId) {
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

    const reservation = crypto.randomUUID();

    recent.push(now);

    history[key] = recent;

    return {
      allowed: true,
      reservation,
      timestamp: now,
    };
  });
}

// ROLLBACK IF PASSWORD SAVE FAILS

export async function cancelPasswordChange(adminId, reservation) {
  // Reservations are represented by timestamps in this implementation.
  // The route should use the timestamp returned above.
  if (!Number.isFinite(reservation)) return;

  const key = String(adminId);

  await withFile(FILES.passwords, (history) => {
    const entries = history[key] || [];

    const index = entries.lastIndexOf(reservation);

    if (index !== -1) entries.splice(index, 1);

    history[key] = entries;
  });
}

// CLEAN EXPIRED SECURITY DATA

export async function cleanupSecurityData() {
  const now = Date.now();

  await withFile(FILES.devices, (devices) => {
    for (const [id, record] of Object.entries(devices)) {
      if (!record || record.expiresAt <= now) {
        delete devices[id];
      }
    }
  });

  await withFile(FILES.blocked, (blocked) => {
    for (const [key, record] of Object.entries(blocked)) {
      if (!record || record.expiresAt <= now) {
        delete blocked[key];
      }
    }
  });

  await withFile(FILES.attempts, (attempts) => {
    for (const [key, record] of Object.entries(attempts)) {
      if (
        !record ||
        now - record.lastAttemptAt >= 24 * 60 * 60 * 1000
      ) {
        delete attempts[key];
      }
    }
  });

  await withFile(FILES.passwords, (history) => {
    for (const [adminId, entries] of Object.entries(history)) {
      const recent = (Array.isArray(entries) ? entries : [])
        .filter(timestamp => timestamp > now - PASSWORD_WINDOW);

      if (recent.length) {
        history[adminId] = recent;
      } else {
        delete history[adminId];
      }
    }
  });

  console.log("GPS: Security JSON cleanup completed");
}
