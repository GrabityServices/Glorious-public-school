require("dotenv").config();
const path = require("path");
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

// Middleware
app.use(cors());
app.use(express.json());
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
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".jfif", ".bmp", ".pdf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only images (.jpg, .jpeg, .png, .webp, .gif, .jfif) and PDF documents (.pdf) are allowed."));
    }
  },
});

// Helper to safely delete an attachment file from the uploads folder
const deleteNoticeFile = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== "string") return;
  // Security check: ensure path is strictly inside /uploads/notices/
  if (relativeUrl.startsWith("/uploads/notices/")) {
    const relativePath = relativeUrl.replace(/^\//, "");
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[File Delete] Removed notice attachment from disk: ${fullPath}`);
      } catch (err) {
        console.error(`[File Delete Error] Could not delete ${fullPath}:`, err.message);
      }
    }
  }
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
app.post("/api/upload/notice-attachment", (req, res) => {
  noticeUpload.single("file")(req, res, (err) => {
    if (err) {
      console.error("[Attachment Upload Error]:", err.message);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size exceeds the 15MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload file." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file was uploaded." });
    }
    const isPdf =
      req.file.mimetype === "application/pdf" ||
      req.file.originalname.toLowerCase().endsWith(".pdf");
    const fileUrl = `/uploads/notices/${req.file.filename}`;
    console.log(`[Attachment Upload] Stored: ${req.file.filename} (${req.file.size} bytes)`);
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

app.post("/api/notices", async (req, res) => {
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

app.put("/api/notices/:id", async (req, res) => {
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

app.delete("/api/notices/:id", async (req, res) => {
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".jfif", ".bmp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .jpeg, .png, .webp, .jfif) are allowed for events."));
    }
  },
});

const deleteEventFile = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== "string") return;
  if (relativeUrl.startsWith("/uploads/events/")) {
    const relativePath = relativeUrl.replace(/^\//, "");
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[File Delete] Removed event image: ${fullPath}`);
      } catch (err) {
        console.error(`[File Delete Error] Could not delete event image ${fullPath}:`, err.message);
      }
    }
  }
};

app.post("/api/upload/event-image", (req, res) => {
  eventUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 10MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload event image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    const fileUrl = `/uploads/events/${req.file.filename}`;
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

app.post("/api/events", async (req, res) => {
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

app.put("/api/events/:id", async (req, res) => {
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

app.delete("/api/events/:id", async (req, res) => {
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
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".jfif", ".bmp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .jpeg, .png, .webp, .jfif) are allowed for staff photos."));
    }
  },
});

const deleteStaffFile = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== "string") return;
  if (relativeUrl.startsWith("/uploads/staff/")) {
    const relativePath = relativeUrl.replace(/^\//, "");
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[File Delete] Removed staff photo: ${fullPath}`);
      } catch (err) {
        console.error(`[File Delete Error] Could not delete staff photo ${fullPath}:`, err.message);
      }
    }
  }
};

app.post("/api/upload/staff-photo", (req, res) => {
  staffUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 10MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload staff photo." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    const fileUrl = `/uploads/staff/${req.file.filename}`;
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

app.post("/api/staff", async (req, res) => {
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

app.put("/api/staff/:id", async (req, res) => {
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

app.delete("/api/staff/:id", async (req, res) => {
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
  limits: { fileSize: 15 * 1024 * 1024 }, // Max 15MB
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp", ".jfif", ".bmp", ".svg"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (.jpg, .jpeg, .png, .webp, .jfif) are allowed for gallery."));
    }
  },
});

const deleteGalleryFile = (relativeUrl) => {
  if (!relativeUrl || typeof relativeUrl !== "string") return;
  if (relativeUrl.startsWith("/uploads/gallery/")) {
    const relativePath = relativeUrl.replace(/^\//, "");
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`[File Delete] Removed gallery image: ${fullPath}`);
      } catch (err) {
        console.error(`[File Delete Error] Could not delete gallery photo ${fullPath}:`, err.message);
      }
    }
  }
};

app.post("/api/upload/gallery-image", (req, res) => {
  galleryUpload.single("file")(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "Image exceeds 15MB limit." });
      }
      return res.status(400).json({ error: err.message || "Failed to upload gallery image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded." });
    }
    const fileUrl = `/uploads/gallery/${req.file.filename}`;
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

app.post("/api/gallery", async (req, res) => {
  try {
    const { title, category, image, imageUrl, caption, date } = req.body;
    const img = image || imageUrl;
    if (!title || !img) {
      return res.status(400).json({ error: "Title and image are required" });
    }
    const newItem = await Gallery.create({
      title,
      category: category || "Campus",
      image: img,
      caption: caption || "",
      date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: "Failed to add gallery item to MongoDB", details: err.message });
  }
});

app.put("/api/gallery/:id", async (req, res) => {
  try {
    // If updating/changing photo, clean up old file if stored in /uploads/gallery/
    const existing = await Gallery.findById(req.params.id);
    if (existing && existing.image && req.body.image && req.body.image !== existing.image) {
      deleteGalleryFile(existing.image);
    }

    const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after" });
    if (!updated) {
      return res.status(404).json({ error: "Gallery item not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update gallery item in MongoDB", details: err.message });
  }
});

app.delete("/api/gallery/:id", async (req, res) => {
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
app.get("/api/inquiries", async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch inquiries from MongoDB", details: err.message });
  }
});

app.post(["/api/inquiries", "/api/contact"], async (req, res) => {
  try {
    const { name, studentName, parentName, email, phone, grade, gradeApplying, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required fields.",
      });
    }

    const newInquiry = await Inquiry.create({
      studentName: studentName || name || parentName || "Student",
      parentName: parentName || name || "Parent",
      name: name || studentName || parentName || "Enquirer",
      email,
      phone: phone || "Not provided",
      gradeApplying: gradeApplying || grade || "General Enquiry",
      grade: grade || gradeApplying || "General Enquiry",
      message,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
    });

    console.log("📨 New inquiry stored in MongoDB Atlas:", newInquiry.id);

    return res.status(201).json({
      success: true,
      message: "Thank you for contacting Glorious Public School! We will get back to you soon.",
      data: newInquiry,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to save inquiry to MongoDB", details: err.message });
  }
});

app.patch("/api/inquiries/:id/status", async (req, res) => {
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

app.put("/api/inquiries/:id", async (req, res) => {
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

app.delete("/api/inquiries/:id", async (req, res) => {
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

app.put("/api/school-info", async (req, res) => {
  try {
    const updated = await SchoolInfo.findOneAndUpdate({}, req.body, { returnDocument: "after", upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update school info in MongoDB", details: err.message });
  }
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

// Start the server with graceful auto-fallback if port is in use
const MAX_PORT_ATTEMPTS = 10;
const initialPort = parseInt(PORT, 10) || 5000;

function startServer(portToTry) {
  const srv = app.listen(portToTry, () => {
    const activePort = srv.address().port;
    currentListeningPort = activePort;
    writeActivePort(activePort);
    console.log(`\n🚀 Backend running at: http://localhost:${activePort}`);
    if (activePort !== initialPort) {
      console.log(`ℹ️  Note: Port ${initialPort} was in use, so backend switched to port ${activePort} automatically.\n`);
    }
  });

  srv.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      if (portToTry - initialPort < MAX_PORT_ATTEMPTS) {
        const nextPort = portToTry + 1;
        console.warn(`[PORT NOTICE] Port ${portToTry} is in use, trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error(`\n[PORT CONFLICT ERROR] Could not find an open port starting from ${initialPort}.`);
        console.error(` How to resolve:`);
        console.error(`  1. Run from project root: npm run free-port`);
        console.error(`  2. Or in PowerShell run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${initialPort}).OwningProcess -Force\n`);
        process.exit(1);
      }
    } else {
      console.error(" Backend Server Error:", error);
    }
  });
}

startServer(initialPort);
