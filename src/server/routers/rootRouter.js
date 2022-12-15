import express from "express";
import { home } from "../controllers/rootController";
import { setNicknameMiddleware } from "../entry/middlewares";

const rootRouter = express.Router();

rootRouter.get("/", setNicknameMiddleware, home);

export default rootRouter;
