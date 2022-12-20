import express from "express";
import { body, query } from "express-validator";
import middlewares from "../entry/middlewares";
import apiController from "../controllers/apiController";

const apiRouter = express.Router();

apiRouter
  .route("/users/email/authenticode")
  .get(
    [query("email").exists().trim().isEmail(), middlewares.validateMiddleware],
    apiController.sendAuthenticodeByEmail
  )
  .post(
    [
      body("email").exists().trim().isEmail(),
      body("authenticode").exists().trim().isLength(6),
      middlewares.validateMiddleware,
    ],
    apiController.postConfirmAuthenticode
  );

apiRouter
  .route("/users/nickname")
  .all([
    body("nickname")
      .exists()
      .trim()
      .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
    middlewares.validateMiddleware,
  ])
  .post(apiController.postConfirmNickname)
  .put(middlewares.alreadySetNicknameMiddleware, apiController.putNickname);

export default apiRouter;
