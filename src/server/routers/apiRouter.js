import express from "express";
import { postEmailAuthenticode } from "../controllers/userController";

const apiRouter = express.Router();

apiRouter.post("/users/email-authentication", postEmailAuthenticode);

export default apiRouter;
