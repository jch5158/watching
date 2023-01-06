import express from "express";
import rootController from "../controllers/rootController";
import userVideoController from "../controllers/userVideoController";
import { body, query } from "express-validator";

const rootRouter = express.Router();

rootRouter.get("/", userVideoController.getHomeVideos);

rootRouter
  .route("/search")
  .all([query("keyword").exists().isLength({ max: 50 })])
  .get(userVideoController.getSearchVideos);

export default rootRouter;
