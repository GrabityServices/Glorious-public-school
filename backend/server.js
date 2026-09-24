require("dotenv").config();
const express = require("express");
const cors = require("cors");
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

// Connect to MongoDB and seed if collections are empty
(async () => {
  const connected = await connectDB();
  if (connected) {
    await seedDatabase();
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// =========================================================
// 1. SYSTEM HEALTH & DB STATUS
// =========================================================
app.get("/api/health", (req, res) => {
  const dbStatus = getDbState();
  res.json({
    status: "ok",
    server: "online",
    port: PORT,
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
// 2. NOTICES / ANNOUNCEMENTS API
// =========================================================
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
    const { title, date, category, author, isImportant, summary, description, fullContent } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }
    const newNotice = await Notice.create({
      title,
      date: date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      category: category || "Notice",
      author: author || "Admin Desk",
      isImportant: !!isImportant,
      summary: summary || description || "",
      description: description || summary || "",
      fullContent: fullContent || summary || description || "",
    });
    res.status(201).json(newNotice);
  } catch (err) {
    res.status(500).json({ error: "Failed to create notice in MongoDB", details: err.message });
  }
});

app.put("/api/notices/:id", async (req, res) => {
  try {
    const updated = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Notice not found" });
    }
    res.json({ success: true, message: "Notice deleted from MongoDB", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete notice from MongoDB", details: err.message });
  }
});

// =========================================================
// 3. EVENTS API
// =========================================================
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
      image: image || "/images/blog1.png",
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
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ success: true, message: "Event deleted from MongoDB", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete event from MongoDB", details: err.message });
  }
});

// =========================================================
// 4. STAFF / FACULTY API
// =========================================================
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
    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const deleted = await Staff.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Staff member not found" });
    }
    res.json({ success: true, message: "Staff member deleted from MongoDB", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete staff member from MongoDB", details: err.message });
  }
});

// =========================================================
// 5. GALLERY API
// =========================================================
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
      return res.status(400).json({ error: "Title and image URL are required" });
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
    const updated = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const deleted = await Gallery.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Gallery item not found" });
    }
    res.json({ success: true, message: "Gallery item deleted from MongoDB", id: req.params.id });
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
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
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
    const updated = await Inquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
    const updated = await SchoolInfo.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update school info in MongoDB", details: err.message });
  }
});

// Start the server with graceful port conflict handler
const server = app.listen(PORT, () => {
  console.log(`Backend running at: http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n[PORT CONFLICT ERROR] Port ${PORT} is already in use by another running process.`);
    console.error(` How to resolve:`);
    console.error(`  1. Run from project root: npm run free-port`);
    console.error(`   2. Or in PowerShell run: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
    console.error(`   3. Or set a different PORT in backend/.env (e.g. PORT=5001)\n`);
    process.exit(1);
  } else {
    console.error(" Backend Server Error:", error);
  }
});
