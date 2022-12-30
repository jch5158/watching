import mongoose from "mongoose";

const userVideoCommentSchema = mongoose.Schema({
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  create_at: { type: Date, required: true, default: Date.now },
  sub_comments: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User_Video_Sub_Comment" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User_Video",
  },
});

const UserVideoComment = mongoose.model(
  "User_Video_Comment",
  userVideoCommentSchema
);
export default UserVideoComment;
