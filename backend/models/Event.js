const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Event" },
    date: { type: String, required: true },
    year: { type: String, default: "2026" },
    time: { type: String, default: "09:00 AM - 02:00 PM" },
    venue: { type: String, default: "Campus Grounds, Jhajha" },
    image: { type: String, default: "/images/blog1.png" },
    shortDesc: { type: String, default: "" },
    fullDesc: { type: String, default: "" },
    highlights: [{ type: String }],
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

module.exports = mongoose.model("Event", EventSchema);
