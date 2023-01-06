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

// import mongoose from "mongoose";
// import User from "../models/User";
// import UserVideo from "../models/UserVideo";
// import Subscriber from "../models/Subscriber";
// import UserVideoComment from "../models/UserVideoComment";
// import UserVideoSubComment from "../models/UserVideoSubComment";

// PORT 넘버
const PORT = app.get("port");

app.listen(PORT, () => console.log(`Server listening, PORT : ${PORT}`));
