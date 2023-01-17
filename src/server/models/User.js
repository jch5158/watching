import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, require: true, unique: true },
  nickname: { type: String, require: true, unique: true },
  password: { type: String },
  sns_account: { type: Boolean, required: true, default: false },
  avatar_url: { type: String, required: true },
  create_at: { type: Date, required: true, default: Date.now },
  subscribers: { type: mongoose.Schema.Types.ObjectId, ref: "Subscriber" },
  subscribe_users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscribe_User",
  },
  user_video_comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Video_Comment",
    },
  ],
  user_video_sub_comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User_Video_Sub_Comment",
    },
  ],
  user_videos: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User_Video",
    },
  ],
});

userSchema.pre("save", async function () {
  // 패스워드가 셋팅되었고 수정되었을 때만 hash
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
