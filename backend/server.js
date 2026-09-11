const express = require("express");
const cors = require("cors");
const announcements = require("./data/announcements.json");

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend can talk to the backend
app.use(cors());

// Enable parsing of JSON request bodies
app.use(express.json());

// In-memory list to store contact and admission inquiries
const inquiries = [];

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Glorious Public School Backend is running smoothly!",
  });
});

// 2. Get school announcements/notices
app.get("/api/announcements", (req, res) => {
  res.json(announcements);
});

// 3. Receive contact / admission enquiry forms
app.post("/api/contact", (req, res) => {
  const { name, email, phone, grade, message } = req.body;

  // Simple validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and message are required fields.",
    });
  }

  const newInquiry = {
    id: inquiries.length + 1,
    name,
    email,
    phone: phone || "Not provided",
    grade: grade || "General Enquiry",
    message,
    submittedAt: new Date().toISOString(),
  };

  inquiries.push(newInquiry);
  console.log("New inquiry received:", newInquiry);

  return res.status(201).json({
    success: true,
    message: "Thank you for contacting Glorious Public School! We will get back to you soon.",
    data: newInquiry,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` Glorious Public School Backend Server   `);
  console.log(` Running on: http://localhost:${PORT}     `);
  console.log(`=========================================`);
});
