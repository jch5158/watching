import mongoose from "mongoose";

const userVideoSchema = mongoose.Schema({
  title: { type: String, maxLength: 50, required: true },
  description: { type: String, maxLength: 400 },
  file_url: { type: String, required: true },
  thumbnail_url: { type: String, require: true },
  hashtags: [{ type: String, maxLength: 100 }],
  likes: { type: Number, required: true, default: 0 },
  create_at: { type: Date, required: true, default: Date.now },
});

userVideoSchema.static("formatHashtags", (hashtags) => {
  return hashtags
    .replace(/\s/gi, "")
    .split(",")
    .filter((element) => element !== "")
    .slice(0, 5)
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const UserVideo = mongoose.model("UserVideo", userVideoSchema);
export default UserVideo;
