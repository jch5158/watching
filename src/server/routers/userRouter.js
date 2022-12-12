import express from "express";
import { body, check } from "express-validator";
import {
  uploadAvatarMiddleware,
  validateMiddleware,
} from "../entry/middlewares";
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
  .post(
    uploadAvatarMiddleware.single("avatar"),
    [
      body("name")
        .exists()
        .trim()
        .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
      body("email").exists().trim().isEmail(),
      body("authenticode").exists().trim().isLength(6),
      body("nickname")
        .exists()
        .trim()
        .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
      body("password")
        .exists()
        .trim()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
        ),
      body("password_confirm")
        .exists()
        .trim()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
        ),
      body("token").exists().trim().isLength(10),
      validateMiddleware,
    ],
    postJoin
  );

userRouter
  .route("/login")
  .get(getLogin)
  .post(
    [
      body("email").exists().isEmail(),
      body("password").exists(),
      validateMiddleware,
    ],
    postLogin
  );
userRouter.get("/logout", getLogout);

export default userRouter;
