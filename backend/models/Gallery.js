const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Campus" },
    image: { type: String, required: true },
    caption: { type: String, default: "" },
    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.imageUrl = ret.image;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Gallery", GallerySchema);
