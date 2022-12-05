import express from "express";
import { getJoin, postJoin } from "../controllers/usersController";
import { uploadAvatarMiddleware } from "../entry/middlewares";

const usersRouter = express.Router();

usersRouter
  .route("/join")
  .get(getJoin)
  .post(uploadAvatarMiddleware.single("avatar"), postJoin);

export default usersRouter;
