const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    qualification: { type: String, default: "" },
    experience: { type: String, default: "" },
    image: { type: String, default: "/images/user1.png" },
    bio: { type: String, default: "" },
    wing: { type: String, default: "Secondary" },
    category: { type: String, default: "Teaching" },
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

module.exports = mongoose.model("Staff", StaffSchema);
