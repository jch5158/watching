import mongoose from "mongoose";

const userVideoSchema = mongoose.Schema({
  title: { type: String, maxLength: 50, required: true },
  description: { type: String, maxLength: 400 },
  file_url: { type: String, required: true },
  thumbnail_url: { type: String, require: true },
  hashtags: [{ type: String, maxLength: 100 }],
  views: { type: Number, required: true, default: 0 },
  likes: { type: Number, required: true, default: 0 },
  create_at: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

userVideoSchema.static("formatHashtags", (hashtags) => {
  return hashtags
    .replace(/\s/gi, "")
    .split(",")
    .filter((element) => element !== "")
    .slice(0, 5)
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const UserVideo = mongoose.model("User_Video", userVideoSchema);
export default UserVideo;
