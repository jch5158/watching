import "dotenv/config";
import "./initDB";
import "./initRedis";
import "../models/User";
import "../models/UserVideo";
import "../models/Subscriber";
import "../models/SubscribeUser";
import "../models/UserVideoComment";
import "../models/UserVideoSubComment";
import fileSystem from "../modules/fileSystem";
import app from "./server";
import User from "../models/User";
import mongoose from "mongoose";
import session from "express-session";

fileSystem.folderExistsAndCreateSync(`${process.cwd()}/error-log`);

// PORT 넘버
const PORT = app.get("port");

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));

// (async () => {
//   let session;
//   try {
//     session = await mongoose.startSession();
//     await session.withTransaction(async () => {
//       const user = await User.findById(
//         "63b9873390dac62da722d86c",
//         {},
//         { session }
//       );

//       if (user.nickname === "devhun") {
//         await session.abortTransaction();
//         return;
//       }
//       user.nickname = "devhun";
//       user.save();
//     });
//   } catch (error) {
//     console.log(error);
//   } finally {
//     await session.endSession;
//   }
// })();
