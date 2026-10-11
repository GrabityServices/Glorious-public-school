const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    category: { type: String, default: "Campus" },
    mediaType: { type: String, enum: ["image", "video"], default: "image" },
    image: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    youtubeId: { type: String, default: "" },
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
