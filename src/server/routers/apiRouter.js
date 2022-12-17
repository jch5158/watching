import express from "express";
import { body, query } from "express-validator";
import {
  validateMiddleware,
  alreadySetNicknameMiddleware,
} from "../entry/middlewares";
import {
  sendAuthenticodeByEmail,
  confirmAuthenticode,
  postConfirmNickname,
  putNickname,
} from "../controllers/userController";

const apiRouter = express.Router();

apiRouter
  .route("/users/email/authenticode")
  .get(
    [query("email").exists().trim().isEmail(), validateMiddleware],
    sendAuthenticodeByEmail
  )
  .post(
    [
      body("email").exists().trim().isEmail(),
      body("authenticode").exists().trim().isLength(6),
      validateMiddleware,
    ],
    confirmAuthenticode
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
