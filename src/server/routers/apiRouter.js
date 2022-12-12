import express from "express";
import { body } from "express-validator";
import { validateMiddleware } from "../entry/middlewares";
import {
  postAuthenticode,
  postConfirmAuthenticode,
} from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post(
  "/users/authenticode",
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

export default apiRouter;
