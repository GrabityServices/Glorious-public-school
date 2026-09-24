require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("./db");

async function testConnection() {
  const success = await connectDB();
  if (success) {
    console.log("✅ MongoDB Atlas connection is working properly.");
    await mongoose.connection.close();
    process.exit(0);
  } else {
    console.log("❌ MongoDB Atlas connection failed.");
    await mongoose.connection.close();
    process.exit(1);
  }
}

testConnection();
