import mongoose from "mongoose";

const subscribeUserSchema = mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

subscribeUserSchema.index({ owner: "hashed" });

const SubscribeUser = mongoose.model("Subscribe_User", subscribeUserSchema);

export default SubscribeUser;
