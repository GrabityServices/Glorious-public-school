
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be configured in .env and contain at least 32 characters."
  );
}

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

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        error: "Access denied. Authentication token missing.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication token missing.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Session expired. Please log in again.",
          code: "TOKEN_EXPIRED",
        });
      }

      return res.status(401).json({
        success: false,
        error: "Invalid authentication token.",
      });
    }

    if (!decoded.id) {
      return res.status(401).json({
        success: false,
        error: "Invalid authentication token.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Administrator account no longer exists.",
      });
    }

    req.admin = admin;
    return next();

  } catch (error) {
    console.error("[AUTH MIDDLEWARE ERROR]", error);

    return res.status(500).json({
      success: false,
      error: "Authentication verification failed.",
    });
  }
}

module.exports = {
  JWT_SECRET,
  signToken,
  requireAuth,
};
