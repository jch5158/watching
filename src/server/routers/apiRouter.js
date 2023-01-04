import express from "express";
import { body, query } from "express-validator";
import middlewares from "../modules/middlewares";
import apiController from "../controllers/apiController";

const apiRouter = express.Router();

apiRouter
  .route("/home/user-videos")
  .all([
    query("count").exists().isNumeric({ min: 1 }),
    middlewares.validateApiMiddleware,
  ])
  .get(apiController.getHomeVideos);

apiRouter
  .route("/users/email/authenticode")
  .get(
    [
      query("email").exists().trim().isEmail(),
      middlewares.validateApiMiddleware,
    ],
    apiController.sendAuthenticodeByEmail
  )
  .post(
    [
      body("email").exists().trim().isEmail(),
      body("authenticode").exists().trim().isLength(6),
      middlewares.validateApiMiddleware,
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
    middlewares.validateApiMiddleware,
  ])
  .post(apiController.postConfirmNickname)
  .put(middlewares.alreadySetNicknameMiddleware, apiController.putNickname);

apiRouter
  .route("/users/:id([0-9a-f]{24})/subscribe")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.subscribeChannel);

apiRouter
  .route("/users/:id([0-9a-f]{24})/unsubscribe")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.unsubscribeChannel);

apiRouter
  .route("/user-videos/:id([0-9a-f]{24})")
  .post(apiController.postPlayUserVideo)
  .put(apiController.putEndUserVideo);

apiRouter
  .route("/user-videos/:id([0-9a-f]{24})/like")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.postLikeVideo);

apiRouter
  .route("/user-videos/:id([0-9a-f]{24})/unlike")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.postUnLikeVideo);

apiRouter
  .route("/user-video-comments")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(
    [
      body("videoId")
        .exists()
        .matches(/[0-9a-f]{24}/),
      body("text").exists(),
      middlewares.validateApiMiddleware,
    ],
    apiController.postVideoComment
  );

apiRouter
  .route("/user-video/:id([0-9a-f]{24})/scroll")
  .all([
    query("count").exists().isNumeric({ min: 1 }),
    middlewares.validateApiMiddleware,
  ])
  .get(apiController.getScrollComments);

apiRouter
  .route("/side-user-videos")
  .all([
    query("userId")
      .exists()
      .matches(/[0-9a-f]{24}/),
    query("videoId")
      .exists()
      .matches(/[0-9a-f]{24}/),
    query("count").exists().isNumeric({ min: 1 }),
    middlewares.validateApiMiddleware,
  ])
  .get(apiController.getScrollSideVideo);

apiRouter
  .route("/user-video-comments/:id([0-9a-f]{24})")
  .all(middlewares.onlyLoginApiMiddleware)
  .put(
    [
      body("text").exists().isLength({ max: 150 }),
      middlewares.validateApiMiddleware,
    ],
    apiController.putVideoComment
  )
  .delete(apiController.deleteVideoComment);

apiRouter
  .route("/user-video-comments/:id([0-9a-f]{24})/like")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.postVideoCommentLike);

apiRouter
  .route("/user-video-comments/:id([0-9a-f]{24})/unlike")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.postVideoCommentUnlike);

apiRouter
  .route("/user-video-comments/:id([0-9a-f]{24})/sub")
  .get(apiController.getVideoSubComment)
  .post(
    middlewares.onlyLoginApiMiddleware,
    [
      body("text").exists().isLength({ max: 150 }),
      middlewares.validateApiMiddleware,
    ],
    apiController.postVideoSubComment
  );

apiRouter
  .route("/user-video-sub-comments/:id([0-9a-f]{24})")
  .all(middlewares.onlyLoginApiMiddleware)
  .put(
    [
      body("text").exists().isLength({ max: 150 }),
      middlewares.validateApiMiddleware,
    ],
    apiController.putVideoSubComment
  )
  .delete(apiController.deleteVideoSubComment);

apiRouter
  .route("/user-video-sub-comments/:id([0-9a-f]{24})/like")
  .all(middlewares.onlyLoginApiMiddleware)
  .post(apiController.postVideoSubCommentLike)
  .delete(apiController.deleteVideoSubCommentLike);

export default apiRouter;
