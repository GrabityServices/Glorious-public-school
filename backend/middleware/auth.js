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
const loginAttempts = new Map(); // ip -> { count, lockedUntil }

function loginRateLimiter(req, res, next) {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };

  // Check if locked
  if (record.lockedUntil > now) {
    const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return res.status(429).json({
      error: `Too many failed login attempts. IP temporarily locked for security. Please try again in ${waitMinutes} minute(s).`,
      code: "RATE_LIMITED",
    });
  }

  // Attach tracker helpers to response
  res.recordFailedLogin = () => {
    record.count += 1;
    if (record.count >= 5) {
      record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes lockout
      record.count = 0;
    }
    loginAttempts.set(ip, record);
  };

  res.recordSuccessfulLogin = () => {
    loginAttempts.delete(ip);
  };

  next();
}

module.exports = {
  JWT_SECRET,
  signToken,
  requireAuth,
  loginRateLimiter,
};
