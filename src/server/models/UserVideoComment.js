import mongoose from "mongoose";

const userVideoCommentSchema = mongoose.Schema({
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  create_at: { type: Date, required: true, default: Date.now },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User_Video",
  },
});

userVideoCommentSchema.index({ owner: "hashed" });
userVideoCommentSchema.index({ video: "1", create_at: "1" });

const UserVideoComment = mongoose.model(
  "User_Video_Comment",
  userVideoCommentSchema
);

export default UserVideoComment;
