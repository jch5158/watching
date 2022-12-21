import express from "express";
import { body } from "express-validator";
import middlewares from "../entry/middlewares";
import userController from "../controllers/userController";

const userRouter = express.Router();

userRouter
  .route("/join")
  .get(userController.getJoin)
  .post(
    middlewares.uploadAvatarMiddleware,
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
      middlewares.validateMiddleware,
    ],
    userController.postJoin
  );

userRouter
  .route("/login")
  .all(middlewares.onlyNotLoginMiddleware)
  .get(userController.getLogin)
  .post(
    [
      body("email").exists().isEmail(),
      body("password").exists(),
      middlewares.validateMiddleware,
    ],
    userController.postLogin
  );

userRouter.get(
  "/logout",
  middlewares.onlyLoginMiddleware,
  userController.getLogout
);

userRouter.get(
  "/kakao/login/start",
  middlewares.onlyNotLoginMiddleware,
  userController.getStartKakaoLogin
);

userRouter.get(
  "/kakao/login/finish",
  middlewares.onlyNotLoginMiddleware,
  userController.getFinishKakaoLogin
);

userRouter.get(
  "/github/login/start",
  middlewares.onlyNotLoginMiddleware,
  userController.getStartGithubLogin
);

userRouter.get(
  "/github/login/finish",
  middlewares.onlyNotLoginMiddleware,
  userController.getFinishGithubLogin
);

userRouter
  .route("/nickname")
  .all(middlewares.onlyLoginMiddleware)
  .all(middlewares.alreadySetNicknameMiddleware)
  .get(userController.getSetUserNickname);

userRouter.get("/:id([0-9a-f]{24})", userController.getProfile);

userRouter
  .route("/profile/edit")
  .all(middlewares.onlyLoginMiddleware)
  .get(userController.getEditUserProfile)
  .post(
    middlewares.uploadAvatarMiddleware,
    [
      body("newNickname")
        .exists()
        .trim()
        .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
      middlewares.validateMiddleware,
    ],
    userController.postEditUserProfile
  );

userRouter
  .route("/password/edit")
  .all(middlewares.onlyLoginMiddleware, middlewares.onlyNotSNSAccountMiddleware)
  .get(userController.getEditPassword)
  .post(
    [
      body("password")
        .exists()
        .trim()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
        ),
      body("new_password")
        .exists()
        .trim()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
        ),
      body("new_password_confirm")
        .exists()
        .trim()
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
        ),
      middlewares.validateMiddleware,
    ],
    userController.postEditPassword
  );

export default userRouter;
