const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    category: { type: String, default: "Notice" },
    author: { type: String, default: "Admin Desk" },
    isImportant: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    fullContent: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
    attachmentUrl: { type: String, default: "" },
    attachmentType: { type: String, default: "" }, // "image" | "pdf"
    attachmentName: { type: String, default: "" },
    attachmentSize: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.summary = ret.summary || ret.description;
        ret.description = ret.description || ret.summary;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Notice", NoticeSchema);
