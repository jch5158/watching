import express from "express";
import { uploadAvatarMiddleware } from "../entry/middlewares";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  getLogout,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter
  .route("/join")
  .get(getJoin)
  .post(uploadAvatarMiddleware.single("avatar"), postJoin);

userRouter.route("/login").get(getLogin).post(postLogin);
userRouter.get("/logout", getLogout);

export default userRouter;
