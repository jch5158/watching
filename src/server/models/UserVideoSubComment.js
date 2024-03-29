import mongoose from "mongoose";

const userVideoSubCommentSchema = mongoose.Schema({
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  create_at: { type: Date, required: true, default: Date.now },
  to_user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User_Video_Comment",
  },
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

userVideoSubCommentSchema.index({ owner: "hashed" });
userVideoSubCommentSchema.index({ comment: "1", create_at: "1" });

const UserVideoSubComment = mongoose.model(
  "User_Video_Sub_Comment",
  userVideoSubCommentSchema
);

export default UserVideoSubComment;
