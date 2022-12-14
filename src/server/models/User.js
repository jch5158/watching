import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, require: true, unique: true },
  nickname: { type: String, unique: true },
  password: { type: String },
  ans_account: { type: Boolean, required: true, default: false },
  avatar_url: { type: String, required: true },
});

userSchema.pre("save", async function () {
  // 패스워드가 셋팅되었고 수정되었을 때만 hash
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});

const User = mongoose.model("User", userSchema);
export default User;
