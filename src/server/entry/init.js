import "dotenv/config";
import "./initDB";
import "./initRedis";
import "../models/User";
import "../models/UserVideo";
import "../models/Subscriber";
import "../models/SubscribeUser";
import "../models/UserVideoComment";
import "../models/UserVideoSubComment";
import app from "./server";

import mongoose from "mongoose";
import User from "../models/User";
import UserVideo from "../models/UserVideo";
import Subscriber from "../models/Subscriber";
import UserVideoComment from "../models/UserVideoComment";
import UserVideoSubComment from "../models/UserVideoSubComment";

// PORT 넘버
const PORT = app.get("port");

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));

// (async () => {
//   const find = await User.find().populate({
//     path: "user_videos",
//     match: { _id: "63a92a8f5b078618ac55ae5e" },
//   });
//   console.log(find[0].user_videos);
// })();

(async () => {
  //   const find = await UserVideo.findById("63a962356f4169dc43981abf").populate({
  //     path: "like",
  //     select: "users.$",
  //     match: { users: "63a9622a6f4169dc43981aba" },
  //     populate: {
  //       path: "users",
  //     },
  //   });
  //   console.log(find.like);
  //   const user = await User.findById("63a9622a6f4169dc43981abb");
  //   if (!user) {
  //     throw new Error("User가 조회되지 않습니다.");
  //   }
  //  console.log(user);
  //   const video = await UserVideo.findById(
  //     "63a97b8e537720ce451cf5d4",
  //     "title"
  //   ).populate({
  //     path: "like",
  //     select: "count users.$",
  //     match: { users: "63a97b7f537720ce451cf5d0" },
  //   });
  //   const exists = await UserVideoLike.findOne(
  //     {
  //       users: { $exists: true, $in: ["63a97b7f537720ce451cf5d0"] },
  //     },
  //     "users.$"
  //   );
  //   console.log(exists);
  // const ret = await UserVideo.findById("63a9c5332a7e71e944e49866").populate({
  //   path: "likes",
  //   populate: {
  //     path: "users",
  //     select: "_id name",
  //     match: { _id: "63a97b7f537720ce451cf5df" },
  //   },
  // });
  // console.log(ret.likes);
  //63a97b7f537720ce451cf5d0
  // await UserVideo.findByIdAndUpdate("63a9c5332a7e71e944e49866", {
  //   $push: { "likes.users": "63a99c040328c0ece379ded3" },
  //   $inc: { "likes.count": 1 },
  // });
  // await User.findByIdAndUpdate("63aa76334c12590fb113b107", {
  //   $push: { subscribe_channels: "63aa73e37734b4bfbf16d880" },
  // });
  // const user = await User.findById("63aaf6fa1f75f780fd5eebe3")
  //   .select("subscribers")
  //   .populate({
  //     path: "subscribers",
  //     select: "users",
  //     populate: {
  //       path: "users",
  //       select: "_id",
  //       match: { _id: "63aaf74f1f75f780fd5eec0d" },
  //     },
  //   });
  // console.log(user.subscribers);
  // await Subscriber.findByIdAndUpdate(user.subscribers, {
  //   $push: { users: "63aaf7031f75f780fd5eebf0" },
  // });
  // console.log(user);
  // const ret = await UserVideo.findById("63abc53b258f85717394e38f", {
  //   select: "comments owner ",
  // })
  //   .populate("owner")
  //   .populate({
  //     path: "comments",
  //     limit: 2,
  //     populate: {
  //       path: "owner",
  //       select: "nickname avatar_url",
  //     },
  //   });
  // console.log(ret.comments[0].owner);
  // let video = await UserVideo.findById("63abc53b258f85717394e38f")
  //   .populate("owner")
  //   .populate({
  //     path: "comments",
  //     select: "-video",
  //     match: { owner: "63abc52d258f85717394e386" },
  //     populate: {
  //       path: "owner",
  //       select: "nickname avatar_url",
  //     },
  //   });
  // await UserVideo.exists({ "comments.owner": "63abc53b258f85717394e38f" });
  // let res = await User.findById("63abed2a3710447e263aab2d").select(
  //   "subscribers"
  // );
  // res = await Subscriber.findById(res.subscribers);
  // console.log(res);
  // let res = await UserVideoComment.findById(
  //   "63ac3ed561b69361f465fe94"
  // ).populate("owner");
  // res = await res.populate("video");
  // console.log(res);
  //db.user_video_comments.aggregate([{$match: { "sub_comments": "63ad1b98d75a22723f642861" },},{$project: { NumberOfItemsInArray: { $size: "$sub_comments" }}}]).pretty();
  // const res = await UserVideoComment.aggregate([
  //   {
  //     $match: { _id: mongoose.Types.ObjectId("63ac3ed561b69361f465fe94") },
  //   },
  //   { $project: { sub_comment_length: { $size: "$sub_comments" } } },
  // ]);
  // console.log(res);
})();
