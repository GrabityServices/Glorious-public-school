const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "glorious_jwt_super_secret_key_2026_gps_jhajha_9534105012";

// Sign a JWT token for an admin
function signToken(admin) {
  return jwt.sign(
    {
      id: admin._id.toString(),
      email: admin.email,
      username: admin.username,
      role: admin.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

// Authentication middleware to protect sensitive administrative routes
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. Authentication token missing.",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          error: "Session expired. Please log in again.",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        error: "Invalid authentication token. Access denied.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({
        error: "Administrator account no longer exists. Access denied.",
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Authentication verification failed." });
  }
}

// In-memory rate limiter to protect login endpoint against brute-force attacks
const loginAttempts = new Map(); // ip -> { count, lockedUntil, lastAttempt }
const MAX_FAILED_ATTEMPTS = 4; // Block when failed attempts > 4 (5th failure)
const WARNING_THRESHOLD = 2; // Show warning starting after 2 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || req.ip || "127.0.0.1";
}

function getLoginStatus(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0, lastAttempt: 0 };

  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    record.count = 0;
    record.lockedUntil = 0;
    loginAttempts.set(ip, record);
  }

  const isLocked = record.lockedUntil > now;
  const remainingMs = isLocked ? record.lockedUntil - now : 0;
  const remainingSeconds = isLocked ? Math.ceil(remainingMs / 1000) : 0;
  const waitMinutes = isLocked ? Math.ceil(remainingMs / 60000) : 0;
  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);

  let warning = null;
  if (!isLocked && record.count >= WARNING_THRESHOLD) {
    if (remainingAttempts > 0) {
      warning = `Warning: ${record.count} failed login attempts detected. If you enter incorrect credentials more than 4 times, your IP will be temporarily blocked. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining)`;
    } else {
      warning = `Final Warning: 4 failed login attempts used. Entering incorrect credentials one more time will immediately block your access for 15 minutes!`;
    }
  }

  return {
    isLocked,
    failedAttempts: record.count,
    maxAttempts: MAX_FAILED_ATTEMPTS,
    remainingAttempts: isLocked ? 0 : remainingAttempts,
    lockedUntil: record.lockedUntil || 0,
    remainingSeconds,
    waitMinutes,
    warning,
  };
}

function loginRateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  let record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0, lastAttempt: 0 };

  // If lockout duration has elapsed, reset counter
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    record.count = 0;
    record.lockedUntil = 0;
    loginAttempts.set(ip, record);
  }

  // If currently locked, block request immediately
  if (record.lockedUntil > now) {
    const remainingMs = record.lockedUntil - now;
    const waitMinutes = Math.ceil(remainingMs / 60000);
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return res.status(429).json({
      error: `Access Blocked: Too many failed login attempts. Your IP has been temporarily locked for security. Please try again in ${waitMinutes} minute(s).`,
      code: "RATE_LIMITED",
      isLocked: true,
      lockedUntil: record.lockedUntil,
      remainingSeconds,
      waitMinutes,
      failedAttempts: record.count,
      maxAttempts: MAX_FAILED_ATTEMPTS,
    });
  }

  // Attach tracker helpers to response
  res.recordFailedLogin = () => {
    record.count += 1;
    record.lastAttempt = Date.now();

    // Block when failed attempts exceed 4 (more than 4 times)
    const isLocked = record.count > MAX_FAILED_ATTEMPTS;
    if (isLocked) {
      record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    loginAttempts.set(ip, record);

    const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - record.count);
    let warning = null;

    if (isLocked) {
      const waitMinutes = Math.ceil(LOCKOUT_DURATION_MS / 60000);
      return {
        isLocked: true,
        failedAttempts: record.count,
        maxAttempts: MAX_FAILED_ATTEMPTS,
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
        waitMinutes,
        error: `Access Blocked: You have entered incorrect credentials more than 4 times. Your IP has been temporarily locked for ${waitMinutes} minutes for security.`,
        code: "RATE_LIMITED",
      };
    }

    // Show warning after entering 2 times (count >= 2)
    if (record.count >= WARNING_THRESHOLD) {
      if (remainingAttempts > 0) {
        warning = `Warning: ${record.count} failed login attempts detected. If you enter incorrect credentials more than 4 times, your IP will be temporarily blocked. (${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining)`;
      } else {
        warning = `Final Warning: 4 failed login attempts used. Entering incorrect credentials one more time will immediately block your access for 15 minutes!`;
      }
    }

    return {
      isLocked: false,
      failedAttempts: record.count,
      maxAttempts: MAX_FAILED_ATTEMPTS,
      remainingAttempts,
      warning,
    };
  };

  res.recordSuccessfulLogin = () => {
    loginAttempts.delete(ip);
  };

  next();
}

// Clean up stale or expired attempts map every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of loginAttempts.entries()) {
    if (val.lockedUntil > 0 && val.lockedUntil <= now) {
      loginAttempts.delete(key);
    } else if (val.lastAttempt && now - val.lastAttempt > 60 * 60 * 1000) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

module.exports = {
  JWT_SECRET,
  signToken,
  requireAuth,
  loginRateLimiter,
  getLoginStatus,
  getClientIp,
  MAX_FAILED_ATTEMPTS,
  WARNING_THRESHOLD,
};
