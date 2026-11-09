const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { connectDB, getDbState, getMaskedUri } = require("./db");
const seedDatabase = require("./seed");

// Mongoose Models
const Notice = require("./models/Notice");
const Event = require("./models/Event");
const Staff = require("./models/Staff");
const Gallery = require("./models/Gallery");
const Inquiry = require("./models/Inquiry");
const SchoolInfo = require("./models/SchoolInfo");
const Admin = require("./models/Admin");

// Authentication & Security Middleware
const { signToken, requireAuth, loginRateLimiter } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 5000;
let currentListeningPort = parseInt(PORT, 10) || 5000;

// Connect to MongoDB and seed if collections are empty
(async () => {
  const connected = await connectDB();
  if (connected) {
    await seedDatabase();
  }
})();

// Ensure uploads/notices, uploads/events, uploads/staff, and uploads/gallery directories exist
const noticeUploadDir = path.join(__dirname, "uploads", "notices");
if (!fs.existsSync(noticeUploadDir)) {
  fs.mkdirSync(noticeUploadDir, { recursive: true });
}
const eventUploadDir = path.join(__dirname, "uploads", "events");
if (!fs.existsSync(eventUploadDir)) {
  fs.mkdirSync(eventUploadDir, { recursive: true });
}
const staffUploadDir = path.join(__dirname, "uploads", "staff");
if (!fs.existsSync(staffUploadDir)) {
  fs.mkdirSync(staffUploadDir, { recursive: true });
}
const galleryUploadDir = path.join(__dirname, "uploads", "gallery");
if (!fs.existsSync(galleryUploadDir)) {
  fs.mkdirSync(galleryUploadDir, { recursive: true });
}
const sliderUploadDir = path.join(__dirname, "uploads", "slider");
if (!fs.existsSync(sliderUploadDir)) {
  fs.mkdirSync(sliderUploadDir, { recursive: true });
}

// =========================================================
// LOGGING SYSTEM (Access, Errors, Visitor Activity)
// =========================================================
const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const appendToLog = (filename, text) => {
  try {
    const logPath = path.join(logsDir, filename);
    fs.appendFileSync(logPath, text + "\n", "utf8");
  } catch (e) {
    console.error(`[Logger Error] Could not write to ${filename}:`, e.message);
  }
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers["x-real-ip"] || req.socket?.remoteAddress || req.ip || "127.0.0.1";
};

// Global unhandled error logging
process.on("unhandledRejection", (reason) => {
  const logMsg = `[${new Date().toISOString()}] [UNHANDLED REJECTION] ${reason?.stack || reason}`;
  console.error(logMsg);
  appendToLog("error.log", logMsg);
});

process.on("uncaughtException", (err) => {
  const logMsg = `[${new Date().toISOString()}] [UNCAUGHT EXCEPTION] ${err?.stack || err.message}`;
  console.error(logMsg);
  appendToLog("error.log", logMsg);
});

// Allowed file extensions across the system (Standard images + HEIC + Camera RAW formats)
const ALLOWED_IMAGE_EXTS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".jfif",
  ".bmp",
  ".avif",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".nef",
  ".cr2",
  ".cr3",
  ".arw",
  ".dng",
  ".raf",
  ".orf",
  ".rw2",
  ".pef",
];
const ALLOWED_NOTICE_EXTS = [...ALLOWED_IMAGE_EXTS, ".pdf"];

// Universal file deletion helper (Strips domains, checks /uploads/ boundary, prevents directory traversal)
function safeDeleteUploadedFile(urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== "string") return false;
  try {
    let clean = urlOrPath.split("?")[0].split("#")[0].trim();
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      try {
        clean = new URL(clean).pathname;
      } catch (_) {}
    }
    const uploadsIndex = clean.indexOf("/uploads/");
    const altIndex = clean.indexOf("uploads/");
    if (uploadsIndex === -1 && altIndex === -1) {
      return false; // Not a local uploaded file (e.g. external link or YouTube)
    }
    const relativeSubpath =
      uploadsIndex !== -1
        ? clean.slice(uploadsIndex + "/uploads/".length)
        : clean.slice(altIndex + "uploads/".length);

    const normalizedSubpath = path.normalize(relativeSubpath).replace(/^(\.\.[\/\\])+/, "");
    const baseUploadsDir = path.resolve(__dirname, "uploads");
    const fullPath = path.resolve(baseUploadsDir, normalizedSubpath);

    // Security guard: verify path is strictly inside backend/uploads/
    if (!fullPath.startsWith(baseUploadsDir)) {
      console.warn(`[Security] Blocked path traversal attempt in file deletion: ${urlOrPath}`);
      return false;
    }

    let deleted = false;
    if (fs.existsSync(fullPath)) {
      const stat = fs.statSync(fullPath);
      if (stat.isFile()) {
        fs.unlinkSync(fullPath);
        deleted = true;
        console.log(`[File Cleanup] Safely deleted file from disk: ${fullPath}`);
      }
    }

    // Also delete any companion extracted JPEG or RAW source file
    const ext = path.extname(fullPath).toLowerCase();
    const baseWithoutExt = fullPath.slice(0, -ext.length);
    if (ext === ".jpg" || ext === ".jpeg") {
      for (const rawExt of [".nef", ".cr2", ".cr3", ".arw", ".dng", ".heic", ".heif", ".tif", ".tiff"]) {
        const companion = baseWithoutExt + rawExt;
        if (fs.existsSync(companion)) {
          try {
            fs.unlinkSync(companion);
            console.log(`[File Cleanup] Deleted companion raw file: ${companion}`);
          } catch (_) {}
        }
      }
    } else {
      const companionJpg = baseWithoutExt + ".jpg";
      if (fs.existsSync(companionJpg)) {
        try {
          fs.unlinkSync(companionJpg);
          console.log(`[File Cleanup] Deleted companion jpeg preview: ${companionJpg}`);
        } catch (_) {}
      }
    }

    return deleted;
  } catch (err) {
    console.error(`[File Cleanup Error] Failed to delete file ${urlOrPath}:`, err.message);
    return false;
  }
}

// Pure Node.js embedded JPEG extractor for Camera RAW files (.nef, .cr2, .dng, .arw, etc.)
function extractRawPreviewJpeg(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).toLowerCase();
  const rawExts = [".nef", ".cr2", ".cr3", ".arw", ".dng", ".raf", ".orf", ".rw2", ".pef", ".tif", ".tiff", ".heic", ".heif"];
  if (!rawExts.includes(ext)) {
    return null;
  }

  try {
    const buffer = fs.readFileSync(filePath);
    const len = buffer.length;
    const soiMarker = Buffer.from([0xff, 0xd8, 0xff]);
    const eoiMarker = Buffer.from([0xff, 0xd9]);

    let bestJpegStart = -1;
    let bestJpegEnd = -1;
    let maxLen = 0;

    let searchPos = 0;
    while (searchPos < len - 4) {
      const soiIdx = buffer.indexOf(soiMarker, searchPos);
      if (soiIdx === -1) break;

      let eoiIdx = buffer.indexOf(eoiMarker, soiIdx + 4);
      let lastValidEoi = -1;
      while (eoiIdx !== -1 && eoiIdx < len) {
        lastValidEoi = eoiIdx + 2;
        const nextSoi = buffer.indexOf(soiMarker, eoiIdx + 2);
        if (nextSoi !== -1 && nextSoi - soiIdx > 50000) {
          break;
        }
        const nextEoi = buffer.indexOf(eoiMarker, eoiIdx + 2);
        if (nextEoi === -1) break;
        eoiIdx = nextEoi;
      }

      if (lastValidEoi > soiIdx) {
        const segLen = lastValidEoi - soiIdx;
        if (segLen > maxLen && segLen > 4096) {
          maxLen = segLen;
          bestJpegStart = soiIdx;
          bestJpegEnd = lastValidEoi;
        }
      }

      searchPos = soiIdx + 4;
    }

    if (bestJpegStart !== -1 && bestJpegEnd > bestJpegStart) {
      const jpegData = buffer.subarray(bestJpegStart, bestJpegEnd);
      const targetJpgPath = filePath.slice(0, -ext.length) + ".jpg";
      fs.writeFileSync(targetJpgPath, jpegData);
      console.log(
        `[RAW Extractor] Successfully extracted embedded JPEG preview: ${targetJpgPath} (${jpegData.length} bytes)`
      );
      return path.basename(targetJpgPath);
    }
  } catch (err) {
    console.error(`[RAW Extractor Error] Could not extract preview from ${filePath}:`, err.message);
  }
  return null;
}

// Middleware
app.use(cors());
app.use(express.json());

// Request & Visitor Logging Middleware (Captures IP, Endpoint, Status, Response Time, UA)
app.use((req, res, next) => {
  const start = Date.now();
  const clientIp = getClientIp(req);
  const method = req.method;
  const url = req.originalUrl || req.url;
  const userAgent = req.headers["user-agent"] || "-";

  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [IP: ${clientIp}] [${method}] ${url} -> ${status} (${duration}ms) - UA: "${userAgent}"`;
    appendToLog("access.log", logEntry);

    if (status >= 400) {
      console.warn(`⚠️ [${status}] ${method} ${url} from IP ${clientIp} (${duration}ms)`);
    }
  });

  next();
});

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================================================
// 1. SYSTEM HEALTH & DB STATUS
// =========================================================
app.get("/api/health", (req, res) => {
  const dbStatus = getDbState();
  res.json({
    status: "ok",
    server: "online",
    port: currentListeningPort,
    timestamp: new Date().toISOString(),
    database: {
      ...dbStatus,
      message: dbStatus.connected
        ? `Connected to MongoDB Atlas (${dbStatus.host})`
        : dbStatus.status === "error"
        ? `MongoDB Connection Failed: ${dbStatus.lastError || "Check credentials in backend/.env"}`
        : "MongoDB disconnected or connecting...",
    },
  });
});

app.get("/api/db-status", (req, res) => {
  res.json(getDbState());
});

// =========================================================
// 1.5. SECURE AUTHENTICATION & ADMIN CREDENTIALS API
// =========================================================

// POST /api/auth/login - Admin Login with brute force rate limiting
app.post("/api/auth/login", loginRateLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      if (res.recordFailedLogin) res.recordFailedLogin();
      return res.status(400).json({ error: "Username/email and password are required." });
    }

    const cleanId = identifier.trim().toLowerCase();
    const admin = await Admin.findOne({
      $or: [{ email: cleanId }, { username: cleanId }],
    });

    if (!admin) {
      if (res.recordFailedLogin) res.recordFailedLogin();
      return res.status(401).json({ error: "Invalid username/email or password." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      if (res.recordFailedLogin) res.recordFailedLogin();
      return res.status(401).json({ error: "Invalid username/email or password." });
    }

    // Success: reset rate limit attempts
    if (res.recordSuccessfulLogin) res.recordSuccessfulLogin();

    admin.lastLogin = new Date();
    await admin.save();

    const token = signToken(admin);
    const expiresIn = 3600; // 1 hour in seconds
    const expiresAt = Date.now() + expiresIn * 1000;

    res.json({
      success: true,
      token,
      expiresIn,
      expiresAt,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An internal error occurred during authentication." });
  }
});

// GET /api/auth/me - Verify current token and return authenticated profile
app.get("/api/auth/me", requireAuth, async (req, res) => {
  res.json({
    authenticated: true,
    admin: req.admin,
  });
});

// PUT /api/auth/change-password - Change password securely with bcrypt verification
app.put("/api/auth/change-password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long." });
    }

    if (!/[a-z]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one lowercase letter (a-z)." });
    }

    if (!/[A-Z]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one uppercase letter (A-Z)." });
    }

    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: "Password must contain at least one number (0-9)." });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(newPassword)) {
      return res.status(400).json({
        error: "Password must contain at least one special symbol (!@#$%^&*()_+-=[]{}...).",
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match." });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ error: "Administrator account not found." });
    }

    const isCurrentValid = await admin.comparePassword(currentPassword);
    if (!isCurrentValid) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    admin.password = newPassword; // Automatically hashed by Mongoose pre-save hook
    await admin.save();

    res.json({
      success: true,
      message: "Password updated successfully. Please use your new password for subsequent logins.",
    });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// PUT /api/auth/profile - Update administrator name, email, avatar
app.put("/api/auth/profile", requireAuth, async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) {
      return res.status(404).json({ error: "Administrator account not found." });
    }

    if (name) admin.name = name.trim();
    if (email) admin.email = email.trim().toLowerCase();
    if (avatar) admin.avatar = avatar.trim();

    await admin.save();

    res.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// =========================================================
// 2. NOTICES / ANNOUNCEMENTS API & ATTACHMENT UPLOADS
// =========================================================

// Configure Multer Storage for Notice Attachments (Saved in separate /uploads/notices/ folder)
const noticeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, noticeUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const base = sanitizedBase || "attachment";
    const uniqueName = `notice_${Date.now()}_${base}${ext}`;
    cb(null, uniqueName);
  },
});

const noticeUpload = multer({
  storage: noticeStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_NOTICE_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} not allowed. Supported: images (JPG, PNG, WebP, HEIC, NEF, CR2, RAW) and PDF.`));
    }
  },
});

// Helper to safely delete an attachment file from the uploads folder
const deleteNoticeFile = (relativeUrl) => {
  safeDeleteUploadedFile(relativeUrl);
};

// Direct File Download Route (Forces download with original filename)
app.get("/api/download", (req, res) => {
  const fileUrl = req.query.file;
  const originalName = req.query.name || "notice-attachment";
  if (!fileUrl || !fileUrl.startsWith("/uploads/notices/")) {
    return res.status(400).send("Invalid file download path.");
  }
  const fullPath = path.join(__dirname, fileUrl.replace(/^\//, ""));
  if (!fs.existsSync(fullPath)) {
    return res.status(404).send("File not found on server.");
  }
  res.download(fullPath, originalName);
});

// Upload Notice Attachment Endpoint
app.post("/api/upload/notice-attachment", requireAuth, (req, res) => {
  noticeUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("[Attachment Upload Error]:", err.message);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the 30MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload file." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }
    const isPdf =
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");

    let finalFilename = req.file.filename;
    if (!isPdf) {
      const previewJpg = extractRawPreviewJpeg(req.file.path);
      if (previewJpg) finalFilename = previewJpg;
    }

    const fileUrl = `/uploads/notices/${finalFilename}`;
    console.log(`[Attachment Upload] Stored: ${finalFilename} (${req.file.size} bytes)`);
    res.json({
      success: true,
      fileUrl,
      attachmentUrl: fileUrl,
      attachmentName: req.file.originalname,
      attachmentType: isPdf ? "pdf" : "image",
      attachmentSize: req.file.size,
    });
  });
});

app.get(["/api/notices", "/api/announcements"], async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notices from MongoDB", details: err.message });
  }
});

app.post("/api/notices", requireAuth, async (req, res) => {
  try {
    const {
      title,
      date,
      category,
      author,
      isImportant,
      summary,
      description,
      fullContent,
      attachmentUrl,
      attachmentType,
      attachmentName,
      attachmentSize,
      pdfUrl,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const resolvedAttachment = attachmentUrl || pdfUrl || "";
    const resolvedType =
      attachmentType ||
      (resolvedAttachment.toLowerCase().endsWith(".pdf") ? "pdf" : resolvedAttachment ? "image" : "");

    const newNotice = await Notice.create({
      title,
      date:
        date ||
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      category: category || "Notice",
      author: author || "Admin Desk",
      isImportant: !!isImportant,
      summary: summary || description || "",
      description: description || summary || "",
      fullContent: fullContent || summary || description || "",
      attachmentUrl: resolvedAttachment,
      attachmentType: resolvedType,
      attachmentName: attachmentName || "",
      attachmentSize: attachmentSize || 0,
      pdfUrl: resolvedType === "pdf" ? resolvedAttachment : "",
    });
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notice in MongoDB", details: err.message });
  }
});

app.put("/api/notices/:id", requireAuth, async (req, res) => {
  try {
    // If updating/clearing attachment, delete old file from disk
    const existing = await Notice.findById(req.params.id);
    if (
      existing &&
      existing.attachmentUrl &&
      req.body.attachmentUrl !== undefined &&
      req.body.attachmentUrl !== existing.attachmentUrl
    ) {
      deleteNoticeFile(existing.attachmentUrl);
    }

    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update notice in MongoDB", details: err.message });
  }
});

app.delete("/api/notices/:id", requireAuth, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    // Automatically remove attached image/pdf from the /uploads/notices/ folder
    if (notice.attachmentUrl) {
      deleteNoticeFile(notice.attachmentUrl);
    }
    if (notice.pdfUrl && notice.pdfUrl !== notice.attachmentUrl) {
      deleteNoticeFile(notice.pdfUrl);
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: "Notice and associated attachment deleted from disk and MongoDB",
      id: req.params.id,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice from MongoDB", details: err.message });
  }
});

// =========================================================
// 3. EVENTS API & EVENT IMAGE UPLOADS
// =========================================================
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const base = sanitizedBase || "event";
    const uniqueName = `event_${Date.now()}_${base}${ext}`;
    cb(null, uniqueName);
  },
});

const eventUpload = multer({
  storage: eventStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} not allowed. Supported formats: JPG, PNG, WebP, HEIC, NEF, CR2, RAW.`));
    }
  },
});

const deleteEventFile = (relativeUrl) => {
  safeDeleteUploadedFile(relativeUrl);
};

app.post("/api/upload/event-image", requireAuth, (req, res) => {
  eventUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 30MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload event image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    let finalFilename = req.file.filename;
    const previewJpg = extractRawPreviewJpeg(req.file.path);
    if (previewJpg) finalFilename = previewJpg;

    const fileUrl = `/uploads/events/${finalFilename}`;
    console.log(`[Event Image Upload] Saved: ${fileUrl}`);
    res.json({ success: true, fileUrl });
  });
});

app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch events from MongoDB", details: err.message });
  }
});

app.post("/api/events", requireAuth, async (req, res) => {
  try {
    const { title, category, date, year, time, venue, image, shortDesc, fullDesc, highlights } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: "Title and Date are required" });
    }
    const newEvent = await Event.create({
      title,
      category: category || "Event",
      date,
      year: year || "2026",
      time: time || "09:00 AM - 02:00 PM",
      venue: venue || "Campus Grounds, Jhajha",
      image: image || "/images/annual-sports-meet.jpg",
      shortDesc: shortDesc || "",
      fullDesc: fullDesc || shortDesc || "",
      highlights: highlights || [],
    });
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: "Failed to create event in MongoDB", details: err.message });
  }
});

app.put("/api/events/:id", requireAuth, async (req, res) => {
  try {
    // If updating/changing image, clean up old file if stored in /uploads/events/
    const existing = await Event.findById(req.params.id);
    if (existing && existing.image && req.body.image && req.body.image !== existing.image) {
      deleteEventFile(existing.image);
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update event in MongoDB", details: err.message });
  }
});

app.delete("/api/events/:id", requireAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    // Delete attached file if in /uploads/events/
    if (event.image) {
      deleteEventFile(event.image);
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Event and image deleted from MongoDB and disk", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event from MongoDB", details: err.message });
  }
});

// =========================================================
// 4. STAFF / FACULTY API & PHOTO UPLOADS
// =========================================================
const staffStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, staffUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const base = sanitizedBase || "teacher";
    const uniqueName = `staff_${Date.now()}_${base}${ext}`;
    cb(null, uniqueName);
  },
});

const staffUpload = multer({
  storage: staffStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} not allowed. Supported formats: JPG, PNG, WebP, HEIC, NEF, CR2, RAW.`));
    }
  },
});

const deleteStaffFile = (relativeUrl) => {
  safeDeleteUploadedFile(relativeUrl);
};

app.post("/api/upload/staff-photo", requireAuth, (req, res) => {
  staffUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 30MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload staff photo." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    let finalFilename = req.file.filename;
    const previewJpg = extractRawPreviewJpeg(req.file.path);
    if (previewJpg) finalFilename = previewJpg;

    const fileUrl = `/uploads/staff/${finalFilename}`;
    console.log(`[Staff Photo Upload] Saved: ${fileUrl}`);
    res.json({ success: true, fileUrl });
  });
});

app.get("/api/staff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: 1 });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch staff from MongoDB", details: err.message });
  }
});

app.post("/api/staff", requireAuth, async (req, res) => {
  try {
    const { name, role, qualification, experience, image, bio, wing, category } = req.body;
    if (!name || !role) {
      return res.status(400).json({ error: "Name and Role are required" });
    }
    const newStaff = await Staff.create({
      name,
      role,
      qualification: qualification || "",
      experience: experience || "",
      image: image || "/images/user1.png",
      bio: bio || "",
      wing: wing || "Secondary",
      category: category || "Teaching",
    });
    res.status(201).json(newStaff);
  } catch (err) {
    res.status(500).json({ error: "Failed to create staff member in MongoDB", details: err.message });
  }
});

app.put("/api/staff/:id", requireAuth, async (req, res) => {
  try {
    // If updating/changing photo, clean up old file if stored in /uploads/staff/
    const existing = await Staff.findById(req.params.id);
    if (existing && existing.image && req.body.image && req.body.image !== existing.image) {
      deleteStaffFile(existing.image);
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update staff member in MongoDB", details: err.message });
  }
});

app.delete("/api/staff/:id", requireAuth, async (req, res) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    // Delete attached file if in /uploads/staff/
    if (member.image) {
      deleteStaffFile(member.image);
    }

    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Staff member and photo deleted from MongoDB and disk", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete staff member from MongoDB", details: err.message });
  }
});

// =========================================================
// 5. GALLERY API & PHOTO UPLOADS
// =========================================================
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, galleryUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const base = sanitizedBase || "photo";
    const uniqueName = `gallery_${Date.now()}_${base}${ext}`;
    cb(null, uniqueName);
  },
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} not allowed. Supported formats: JPG, PNG, WebP, HEIC, NEF, CR2, RAW.`));
    }
  },
});

const deleteGalleryFile = (relativeUrl) => {
  safeDeleteUploadedFile(relativeUrl);
};

app.post("/api/upload/gallery-image", requireAuth, (req, res) => {
  galleryUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 30MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload gallery image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    let finalFilename = req.file.filename;
    const previewJpg = extractRawPreviewJpeg(req.file.path);
    if (previewJpg) finalFilename = previewJpg;

    const fileUrl = `/uploads/gallery/${finalFilename}`;
    console.log(`[Gallery Image Upload] Saved: ${fileUrl}`);
    res.json({ success: true, fileUrl });
  });
});

app.get("/api/gallery", async (req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery from MongoDB", details: err.message });
  }
});

const extractYouTubeId = (input = "") => {
  const str = String(input).trim();
  if (!str) return "";
  // Match iframe src if user pasted full <iframe ... src="...">
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  const target = iframeMatch ? iframeMatch[1] : str;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = target.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(target)) return target;
  return "";
};

app.post("/api/gallery", requireAuth, async (req, res) => {
  try {
    const { title, category, image, imageUrl, mediaType, videoUrl, youtubeId, caption, date } = req.body;
    const isVideo = mediaType === "video" || Boolean(videoUrl || youtubeId);
    const extractedYtId = isVideo ? (extractYouTubeId(youtubeId) || extractYouTubeId(videoUrl)) : "";
    const img = image || imageUrl || (extractedYtId ? `https://img.youtube.com/vi/${extractedYtId}/hqdefault.jpg` : "");

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (isVideo && !extractedYtId && !videoUrl) {
      return res.status(400).json({ error: "Valid YouTube video link or embed URL is required" });
    }
    if (!isVideo && !img) {
      return res.status(400).json({ error: "Image is required for photo gallery items" });
    }

    const embedUrl = extractedYtId ? `https://www.youtube.com/embed/${extractedYtId}` : (videoUrl || "");

    const newItem = await Gallery.create({
      title,
      category: category || "Events",
      mediaType: isVideo ? "video" : "image",
      image: img,
      videoUrl: isVideo ? embedUrl : "",
      youtubeId: extractedYtId,
      caption: caption || "",
      date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add gallery item to MongoDB", details: err.message });
  }
});

app.put("/api/gallery/:id", requireAuth, async (req, res) => {
  try {
    const existing = await Gallery.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Gallery item not found" });
    }
    if (existing.image && req.body.image && req.body.image !== existing.image) {
      deleteGalleryFile(existing.image);
    }

    const updatePayload = { ...req.body };
    if (updatePayload.mediaType === "video" || updatePayload.videoUrl || updatePayload.youtubeId) {
      const ytId = extractYouTubeId(updatePayload.youtubeId) || extractYouTubeId(updatePayload.videoUrl);
      if (ytId) {
        updatePayload.youtubeId = ytId;
        updatePayload.videoUrl = `https://www.youtube.com/embed/${ytId}`;
        if (!updatePayload.image || updatePayload.image.includes("img.youtube.com")) {
          updatePayload.image = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }
    }

    const updated = await Gallery.findByIdAndUpdate(req.params.id, updatePayload, { returnDocument: "after" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update gallery item in MongoDB", details: err.message });
  }
});

app.delete("/api/gallery/:id", requireAuth, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Gallery item not found" });
    }
    // Delete attached file if in /uploads/gallery/
    if (item.image) {
      deleteGalleryFile(item.image);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Gallery item and image deleted from MongoDB and disk", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete gallery item from MongoDB", details: err.message });
  }
});

// =========================================================
// 6. INQUIRIES & ADMISSIONS LEADS API
// =========================================================
app.get(["/api/inquiries", "/api/admissions"], requireAuth, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inquiries from MongoDB", details: err.message });
  }
});

app.post(["/api/inquiries", "/api/contact", "/api/admissions"], async (req, res) => {
  try {
    const {
      appId,
      type,
      name,
      studentName,
      dob,
      gender,
      applyingClass,
      grade,
      gradeApplying,
      fatherName,
      motherName,
      parentName,
      email,
      phone,
      address,
      needTransport,
      needHostel,
      previousSchool,
      message,
      notes,
    } = req.body;

    if (!phone && !email) {
      return res.status(400).json({
        success: false,
        message: "A phone number or email is required.",
      });
    }

    const isAdmission =
      type === "Online Admission" ||
      Boolean(applyingClass || dob || fatherName || (req.body.studentName && req.body.studentName !== req.body.name));

    const resolvedType = type || (isAdmission ? "Online Admission" : "Contact Inquiry");

    // Only generate an Application ID code for Online Admissions!
    const generatedAppId = isAdmission
      ? appId || `GPS-${Math.floor(100000 + Math.random() * 900000)}`
      : "";

    const resolvedStudent = studentName || name || parentName || "Student";
    const resolvedFather = fatherName || parentName || name || "";
    const resolvedClass = isAdmission ? (applyingClass || gradeApplying || grade || "Nursery") : "";

    const newInquiry = await Inquiry.create({
      appId: generatedAppId,
      type: resolvedType,
      studentName: isAdmission ? resolvedStudent : "",
      name: resolvedStudent,
      dob: dob || "",
      gender: gender || "Male",
      applyingClass: resolvedClass,
      gradeApplying: gradeApplying || resolvedClass || "",
      grade: resolvedClass || grade || "",
      fatherName: resolvedFather,
      motherName: motherName || "",
      parentName: resolvedFather || motherName || "Parent",
      email: email || "",
      phone: phone || "Not provided",
      address: address || "",
      needTransport: needTransport || "No",
      needHostel: needHostel || "No",
      previousSchool: previousSchool || "",
      message: message || `Online Student Admission Application for ${resolvedClass} (Session 2026-2027)`,
      notes: notes || "",
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
    });

    console.log("📨 New admission / inquiry stored in MongoDB Atlas:", newInquiry.id, newInquiry.appId);

    return res.status(201).json({
      success: true,
      message: "Thank you for applying to Glorious Public School! We will contact you soon.",
      data: newInquiry,
      appId: generatedAppId,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to save inquiry to MongoDB", details: err.message });
  }
});

app.patch(["/api/inquiries/:id/status", "/api/admissions/:id/status"], requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry status in MongoDB", details: err.message });
  }
});

app.put(["/api/inquiries/:id", "/api/admissions/:id"], requireAuth, async (req, res) => {
  try {
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update inquiry in MongoDB", details: err.message });
  }
});

app.delete(["/api/inquiries/:id", "/api/admissions/:id"], requireAuth, async (req, res) => {
  try {
    const deleted = await Inquiry.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Inquiry not found" });
    }
    res.json({ success: true, message: "Inquiry deleted from MongoDB", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete inquiry from MongoDB", details: err.message });
  }
});

// =========================================================
// 6B. HOMEPAGE HERO SLIDER UPLOAD API
// =========================================================
const sliderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, sliderUploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 40);
    const base = sanitizedBase || "slide";
    const uniqueName = `slide_${Date.now()}_${base}${ext}`;
    cb(null, uniqueName);
  },
});

const sliderUpload = multer({
  storage: sliderStorage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max 30MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED_IMAGE_EXTS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File format ${ext} not allowed. Supported formats: JPG, PNG, WebP, HEIC, NEF, CR2, RAW.`));
    }
  },
});

app.post("/api/upload/slider-image", requireAuth, (req, res) => {
  sliderUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 30MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload slider image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    let finalFilename = req.file.filename;
    const previewJpg = extractRawPreviewJpeg(req.file.path);
    if (previewJpg) finalFilename = previewJpg;

    const fileUrl = `/uploads/slider/${finalFilename}`;
    console.log(`[Slider Image Upload] Saved: ${fileUrl}`);
    res.json({ success: true, fileUrl });
  });
});

// Explicit Uploaded File Deletion Endpoint (For draft cleanups on cancel/replace)
app.delete("/api/upload/file", requireAuth, (req, res) => {
  const fileUrl = req.body?.fileUrl || req.query?.fileUrl;
  if (!fileUrl) {
    return res.status(400).json({ error: "fileUrl parameter is required." });
  }
  const deleted = safeDeleteUploadedFile(fileUrl);
  res.json({ success: true, deleted, fileUrl });
});

// =========================================================
// 6C. AUDIT & ERROR LOGGING APIS (Frontend Error & Visitor Logs)
// =========================================================
app.post("/api/logs/client-error", (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const timestamp = new Date().toISOString();
    const { message, stack, componentStack, route, userAgent } = req.body || {};
    const logText = `[${timestamp}] [CLIENT ERROR] [IP: ${clientIp}] [Route: ${route || "-"}]\nMessage: ${message || "Unknown error"}\nStack: ${stack || "-"}\nComponent: ${componentStack || "-"}\nUA: ${userAgent || req.headers["user-agent"] || "-"}\n---`;
    appendToLog("client-error.log", logText);
    console.error(`🚨 [Client Error from ${clientIp} on ${route || "app"}]:`, message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record client error" });
  }
});

app.post("/api/logs/visitor", (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const timestamp = new Date().toISOString();
    const { path: vPath, title, referrer, screen, sessionId } = req.body || {};
    const userAgent = req.headers["user-agent"] || "-";
    const logText = `[${timestamp}] [VISIT] [IP: ${clientIp}] Path: "${vPath || "/"}" Title: "${title || ""}" Session: ${sessionId || "-"} Screen: ${screen || "-"} Ref: "${referrer || "-"}" UA: "${userAgent}"`;
    appendToLog("visitor.log", logText);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to record visitor log" });
  }
});

// =========================================================
// 7. SCHOOL INFO & SETTINGS API
// =========================================================
app.get("/api/school-info", async (req, res) => {
  try {
    let info = await SchoolInfo.findOne();
    if (!info) {
      info = await SchoolInfo.create({});
    }
    res.json(info);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch school info from MongoDB", details: err.message });
  }
});

app.put("/api/school-info", requireAuth, async (req, res) => {
  try {
    const existing = await SchoolInfo.findOne();
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;

    // Automatic cleanup: if slider images were deleted or replaced, delete old file from disk
    if (existing && Array.isArray(existing.heroSlides) && Array.isArray(updateData.heroSlides)) {
      const newSlideImages = new Set(updateData.heroSlides.map((s) => s.image).filter(Boolean));
      existing.heroSlides.forEach((oldSlide) => {
        if (oldSlide && oldSlide.image && !newSlideImages.has(oldSlide.image)) {
          safeDeleteUploadedFile(oldSlide.image);
        }
      });
    }

    if (updateData.isAdmissionsOpen === false) {
      updateData.showAdmissionNotice = false;
    }
    const updated = await SchoolInfo.findOneAndUpdate({}, updateData, { returnDocument: "after", upsert: true });
    console.log("🏫 [MongoDB Atlas] SchoolInfo updated successfully in cluster.");
    res.json(updated);
  } catch (err) {
    console.error("❌ Failed to update school info in MongoDB Atlas:", err);
    res.status(500).json({ error: "Failed to update school info in MongoDB", details: err.message });
  }
});

// Global Express Error Handler Middleware
app.use((err, req, res, next) => {
  const clientIp = getClientIp(req);
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const errorMsg = `[${timestamp}] [EXPRESS ERROR] [IP: ${clientIp}] [${method} ${url}]\n${err?.stack || err?.message || err}\n---`;
  appendToLog("error.log", errorMsg);
  console.error(`💥 [Server Error at ${method} ${url}]:`, err.message);

  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    error: err.message || "An unexpected internal server error occurred.",
    timestamp,
  });
});

// Active port tracking file for Vite dev server and proxy synchronization
const activePortFile = path.join(__dirname, ".active-port");

function writeActivePort(port) {
  try {
    fs.writeFileSync(activePortFile, String(port), "utf8");
  } catch (e) {
    // Ignore active-port write failures
  }
}

function cleanActivePort() {
  try {
    if (fs.existsSync(activePortFile)) {
      fs.unlinkSync(activePortFile);
    }
  } catch (e) {}
}

process.on("exit", cleanActivePort);
process.on("SIGINT", () => {
  cleanActivePort();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanActivePort();
  process.exit(0);
});

// Start the server strictly on port 5000
const initialPort = parseInt(PORT, 10) || 5000;

function startServer(portToTry) {
  const srv = app.listen(portToTry, () => {
    const activePort = srv.address().port;
    currentListeningPort = activePort;
    writeActivePort(activePort);
    console.log(`\n🚀 Backend running at: http://localhost:${activePort}`);
  });

  srv.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`\n[PORT CONFLICT ERROR] Port ${portToTry} is already in use.`);
      console.error(`👉 Run 'npm run free-port' to free port ${portToTry}.\n`);
      process.exit(1);
    } else {
      console.error(" Backend Server Error:", error);
    }
  });
}

startServer(initialPort);
