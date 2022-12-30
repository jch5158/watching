import mongoose from "mongoose";

const subscriberSchema = mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});

const Subscriber = mongoose.model("Subscriber", subscriberSchema);
export default Subscriber;
