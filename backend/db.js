const mongoose = require("mongoose");

// Mask password for safe logging
const getMaskedUri = (uri) => {
  if (!uri) return "Not Configured";
  return uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    "mongodb$1://$2:****@",
  );
};

// Global state tracking
let dbConnectionState = {
  status: "disconnected",
  connected: false,
  host: null,
  database: null,
  lastError: null,
};

const setupConnectionListeners = () => {
  // Avoid registering duplicate listeners if called multiple times
  if (mongoose.connection.listenerCount("connected") > 0) return;

  mongoose.connection.on("connected", () => {
    dbConnectionState = {
      status: "connected",
      connected: true,
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      lastError: null,
    };
    console.log(`MongoDB Connected successfully`);
  });

  mongoose.connection.on("error", (err) => {
    dbConnectionState = {
      status: "error",
      connected: false,
      host: null,
      database: null,
      lastError: err.message,
    };
    console.error(`\n❌ [MongoDB Error]: ${err.message}\n`);
  });

  mongoose.connection.on("disconnected", () => {
    dbConnectionState = {
      status: "disconnected",
      connected: false,
      host: null,
      database: null,
      lastError: null,
    };
    console.warn(`\n⚠️  [MongoDB Notice]: Disconnected from cluster\n`);
  });
};

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "\n❌ [MongoDB Notice]: MONGODB_URI is not set in backend/.env",
    );
    console.error("👉 Please add your MongoDB Atlas URI to backend/.env\n");
    return false;
  }

  if (uri.includes("<db_password>")) {
    console.warn(
      "\n⚠️  [MongoDB Notice]: MONGODB_URI contains '<db_password>' placeholder.",
    );
    console.warn(
      "👉 Please edit backend/.env and replace <db_password> with your actual MongoDB user password.\n",
    );
    return false;
  }

  setupConnectionListeners();

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    return true;
  } catch (error) {
    dbConnectionState = {
      status: "error",
      connected: false,
      host: null,
      database: null,
      lastError: error.message,
    };

    console.error(`\n======================================================`);
    console.error(` ❌ MongoDB Connection Failed: ${error.message}`);
    if (
      error.codeName === "AtlasError" ||
      error.message.includes("bad auth") ||
      error.message.includes("Authentication failed")
    ) {
      const match = uri.match(/mongodb(?:\+srv)?:\/\/([^:]+):/);
      const user = match ? match[1] : "user";
      console.error(` 💡 Hint: Authentication failed for user '${user}'.`);
      console.error(`    Please check your database password in backend/.env`);
    } else if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("querySrv")
    ) {
      console.error(
        ` 💡 Hint: DNS lookup failed. Please check your internet connection or MongoDB Atlas cluster hostname.`,
      );
    }
    console.error(`======================================================\n`);
    return false;
  }
};

const getDbState = () => {
  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;
  const isConnected = readyState === 1;
  return {
    ...dbConnectionState,
    readyState,
    connected: isConnected,
    host: isConnected ? mongoose.connection.host : null,
    database: isConnected ? mongoose.connection.name : null,
  };
};

module.exports = { connectDB, getDbState, getMaskedUri };
