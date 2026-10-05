const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    appId: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["Online Admission", "Contact Inquiry", "General Inquiry"],
      default: "Online Admission",
    },
    studentName: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "Male" },
    applyingClass: { type: String, default: "" },
    gradeApplying: { type: String, default: "" },
    grade: { type: String, default: "" },
    fatherName: { type: String, default: "" },
    motherName: { type: String, default: "" },
    parentName: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    needTransport: { type: String, default: "No" },
    needHostel: { type: String, default: "No" },
    previousSchool: { type: String, default: "" },
    message: {
      type: String,
      default: "Online Student Admission Application (Session 2026-2027)",
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Admitted", "Rejected"],
      default: "Pending",
    },
    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.name = ret.name || ret.studentName || ret.parentName || ret.fatherName;
        ret.studentName = ret.studentName || ret.name;
        ret.fatherName = ret.fatherName || ret.parentName;
        ret.parentName = ret.parentName || ret.fatherName || ret.motherName;
        ret.applyingClass = ret.applyingClass || ret.gradeApplying || ret.grade;
        ret.gradeApplying = ret.gradeApplying || ret.applyingClass || ret.grade;
        ret.grade = ret.grade || ret.applyingClass || ret.gradeApplying;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Inquiry", InquirySchema);
