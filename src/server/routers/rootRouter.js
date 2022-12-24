import express from "express";
import rootController from "../controllers/rootController";
import userVideoController from "../controllers/userVideoController";

const rootRouter = express.Router();

rootRouter.get("/", userVideoController.getHomeVideos);

export default rootRouter;
