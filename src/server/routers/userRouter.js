import express from "express";
import { body } from "express-validator";
import {
  uploadAvatarMiddleware,
  validateMiddleware,
  alreadySetNicknameMiddleware,
} from "../entry/middlewares";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  getLogout,
  getStartKakaoLogin,
  getFinishKakaoLogin,
  getStartGithubLogin,
  getFinishGithubLogin,
  postSetUserNickname,
  getSetUserNickname,
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

userRouter.get("/kakao/login/start", getStartKakaoLogin);
userRouter.get("/kakao/login/finish", getFinishKakaoLogin);

userRouter.get("/github/login/start", getStartGithubLogin);
userRouter.get("/github/login/finish", getFinishGithubLogin);

userRouter
  .route("/nickname/set")
  .all(alreadySetNicknameMiddleware)
  .get(getSetUserNickname)
  .post(
    [
      body("nickname")
        .exists()
        .trim()
        .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
      validateMiddleware,
    ],
    postSetUserNickname
  );

export default userRouter;
