import express from "express";
import { body } from "express-validator";
import middlewares from "../modules/middlewares";
import userVideoController from "../controllers/userVideoController";

const videoRouter = express.Router();

videoRouter.get("/:id([0-9a-f]{24})", userVideoController.getWatchVideo);

videoRouter
  .route("/upload")
  .all(middlewares.onlyLoginMiddleware)
  .get(userVideoController.getUploadVideo)
  .post(
    middlewares.uploadUserVideoMiddleware,
    [
      body("title").exists().trim().isLength({ min: 1, max: 50 }),
      body("description").trim().isLength({ min: 1, max: 400 }),
      body("hashtags").trim().isLength({ max: 95 }),
      middlewares.validateMiddleware,
    ],
    userVideoController.postUploadVideo
  );

export default videoRouter;
