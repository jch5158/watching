import mongoose from "mongoose";

const subscribeUserSchema = mongoose.Schema({
  users: [
    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  ],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

const SubscribeUser = mongoose.model("Subscribe_User", subscribeUserSchema);

export default SubscribeUser;
