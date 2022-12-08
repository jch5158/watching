import express from "express";
import {
  postAuthenticode,
  postConfirmAuthenticode,
} from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post("/users/authenticate", postAuthenticode);
apiRouter.post("/users/confirm-authenticode", postConfirmAuthenticode);

export default apiRouter;
