const mongoose = require("mongoose");

const InquirySchema = new mongoose.Schema(
  {
    studentName: { type: String, default: "" },
    parentName: { type: String, default: "" },
    name: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    gradeApplying: { type: String, default: "" },
    grade: { type: String, default: "" },
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
    message: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.name = ret.name || ret.studentName || ret.parentName;
        ret.studentName = ret.studentName || ret.name;
        ret.grade = ret.grade || ret.gradeApplying;
        ret.gradeApplying = ret.gradeApplying || ret.grade;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Inquiry", InquirySchema);
