const mongoose = require("mongoose");

const SchoolInfoSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Glorious Public School" },
    tagline: {
      type: String,
      default: "Dedicated to create erudite, upright leaders of tomorrow's world",
    },
    affiliation: {
      type: String,
      default: "Recognized Co-Educational English Medium School (Nursery to Class 10th)",
    },
    code: { type: String, default: "GPS-JHAJHA-811308" },
    established: { type: String, default: "2015" },
    phone: { type: String, default: "9534105012" },
    phoneAlt: { type: String, default: "+91 95341 05012" },
    email: { type: String, default: "gpsjhajha@gmail.com" },
    address: { type: String, default: "Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308" },
    city: { type: String, default: "Jhajha" },
    district: { type: String, default: "Jamui" },
    state: { type: String, default: "Bihar" },
    pincode: { type: String, default: "811308" },
    landmark: { type: String, default: "Near Koltex, Petrol Pump" },
    admissionNotice: {
      type: String,
      default: "ADMISSION OPEN FOR NURSERY TO CLASS 10TH (ACADEMIC SESSION 2026-2027) — APPLY TODAY!",
    },
    aboutText: { type: String, default: "" },
    vision: { type: String, default: "" },
    mission: { type: String, default: "" },
    stats: [
      {
        label: { type: String },
        value: { type: String },
        suffix: { type: String, default: "" },
      },
    ],
    openingHours: [
      {
        day: { type: String },
        time: { type: String },
        status: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("SchoolInfo", SchoolInfoSchema);
