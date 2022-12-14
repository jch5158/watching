import express from "express";
import { body } from "express-validator";
import { validateMiddleware } from "../entry/middlewares";
import {
  postAuthenticode,
  postConfirmAuthenticode,
  postConfirmNickname,
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
apiRouter.post(
  "/users/confirm-nickname",
  [
    body("nickname")
      .exists()
      .trim()
      .matches(/^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/),
    validateMiddleware,
  ],
  postConfirmNickname
);

export default apiRouter;
