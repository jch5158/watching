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
      body("duration").exists().isNumeric({ min: 1 }),
      body("hashtags").trim().isLength({ max: 95 }),
      middlewares.validateMiddleware,
    ],
    userVideoController.postUploadVideo
  );

videoRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(middlewares.onlyLoginMiddleware)
  .get(userVideoController.getEditVideo)
  .post(
    middlewares.uploadUserVideoMiddleware,
    [
      body("title").exists().trim().isLength({ min: 1, max: 50 }),
      body("description").trim().isLength({ min: 1, max: 400 }),
      body("duration").exists().isNumeric({ min: 1 }),
      body("hashtags").trim().isLength({ max: 95 }),
      middlewares.validateMiddleware,
    ],
    userVideoController.postEditVideo
  );

export default videoRouter;
