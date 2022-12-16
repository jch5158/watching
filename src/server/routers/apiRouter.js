import express from "express";
import { body } from "express-validator";
import {
  validateMiddleware,
  alreadySetNicknameMiddleware,
} from "../entry/middlewares";
import {
  postAuthenticode,
  postConfirmAuthenticode,
  postConfirmNickname,
  putNickname,
} from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post(
  "/users/post-authenticode",
  [body("email").exists().trim().isEmail(), validateMiddleware],
  postAuthenticode
);

apiRouter.post(
  "/users/confirm-authenticode",
  [
    body("email").exists().trim().isEmail(),
    body("authenticode").exists().trim().isLength(6),
    validateMiddleware,
  ],
  postConfirmAuthenticode
);

apiRouter
  .route("/users/nickname")
  .all(alreadySetNicknameMiddleware, [
    body("nickname")
      .exists()
      .trim()
      .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
    validateMiddleware,
  ])
  .post(postConfirmNickname)
  .put(putNickname);

export default apiRouter;
