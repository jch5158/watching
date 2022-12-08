import express from "express";
import { getJoin, postJoin } from "../controllers/userController";
import { uploadAvatarMiddleware } from "../entry/middlewares";

const userRouter = express.Router();

userRouter
  .route("/join")
  .get(getJoin)
  .post(uploadAvatarMiddleware.single("avatar"), postJoin);

export default userRouter;
