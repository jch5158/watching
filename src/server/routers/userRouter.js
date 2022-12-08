import express from "express";
import { uploadAvatarMiddleware } from "../entry/middlewares";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter
  .route("/join")
  .get(getJoin)
  .post(uploadAvatarMiddleware.single("avatar"), postJoin);

userRouter.route("/login").get(getLogin).post(postLogin);

export default userRouter;
