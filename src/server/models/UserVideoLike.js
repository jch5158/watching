import mongoose from "mongoose";

const userVideoLikeSchema = mongoose.Schema({
  video: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "UserVide",
  },
  count: { type: Number, required: true, default: 0 },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

const UserVideoLike = mongoose.model("User_Video_Like", userVideoLikeSchema);
export default UserVideoLike;
