import "dotenv/config";
import "./initDB";
import "./initRedis";
import "../models/User";
import "../models/UserVideo";
import "../models/UserVideoLike";
import app from "./server";

import User from "../models/User";
import UserVideoLike from "../models/UserVideoLike";
import UserVideo from "../models/UserVideo";

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
})();
