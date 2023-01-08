import User from "../models/User";
import UserVideo from "../models/UserVideo";
import redisClient from "../entry/initRedis";
import { createRandToken } from "../modules/common";
import { sendAuthenticodeEmail } from "../modules/mailer";
import Subscriber from "../models/Subscriber";
import UserVideoComment from "../models/UserVideoComment";
import SubscribeUser from "../models/SubscribeUser";
import UserVideoSubComment from "../models/UserVideoSubComment";
import mongooseQuery from "../modules/mongooseQuery";
import fileSystem from "../modules/fileSystem";
import mongoose from "mongoose";
import awsModule from "../modules/awsModule";

const apiController = (function () {
  const apiController = {
    async getHomeVideos(req, res, next) {
      const {
        query: { count, keyword },
      } = req;

      let findQuery = {};
      if (keyword) {
        findQuery = {
          $or: [
            { title: { $regex: new RegExp(`${keyword}`, "i") } },
            { hashtags: { $regex: new RegExp(`#${keyword}`, "i") } },
          ],
        };
      }

      try {
        const videos = await UserVideo.find(
          findQuery,
          "title thumbnail_url views create_at",
          {
            skip: 12 * count,
            limit: 12,
            sort: { create_at: "desc" },
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          }
        );

        return res.status(200).json(videos);
      } catch (error) {
        return next(error);
      }
    },

    async getProfileVideos(req, res, next) {
      const {
        query: { count, channelId },
      } = req;

      try {
        const videos = await UserVideo.find(
          { owner: channelId },
          "title thumbnail_url owner views create_at",
          {
            skip: 12 * count,
            limit: 12,
            sort: { create_at: -1 },
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          }
        );
        if (!videos) {
          return res.sendStatus(400);
        }

        return res.status(200).json(videos);
      } catch (error) {
        return next(error);
      }
    },

    async getVerticalSubscriber(req, res, next) {
      const {
        query: { id, count },
      } = req;

      try {
        const subscribers = await Subscriber.findOne({ owner: id }, "users", {
          populate: {
            path: "users",
            options: {
              limit: 11,
              skip: count * 11,
            },
            select: "nickname avatar_url",
          },
        });

        if (!subscribers) {
          return res.sendStatus(400);
        }
        return res.status(200).json(subscribers);
      } catch (error) {
        return next(error);
      }
    },

    async sendAuthenticodeByEmail(req, res, next) {
      const { email } = req.query;
      const exists = await User.exists({ email });
      if (exists) {
        return res.sendStatus(400);
      }
      const authenticode = createRandToken(6);
      redisClient.setEx(email, 180, authenticode, async (error, result) => {
        if (error) {
          return next(error);
        }
        await sendAuthenticodeEmail(email, authenticode);
        return res.sendStatus(200);
      });
    },

    postConfirmAuthenticode(req, res, next) {
      const {
        body: { email, authenticode },
      } = req;

      redisClient.get(email, (error, redisAuthenticode) => {
        if (error) {
          return next(error);
        } else {
          if (String(authenticode) !== String(redisAuthenticode)) {
            return res.sendStatus(400);
          }

          redisClient.del(email, (error, result) => {
            if (error) {
              return next(error);
            }
          });

          const token = createRandToken(10);
          redisClient.setEx(
            `${email}/${authenticode}`,
            1800,
            token,
            (error, result) => {
              if (error) {
                return next(error);
              }
              return res.status(200).json({ token });
            }
          );
        }
      });
    },

    async postConfirmNickname(req, res, next) {
      const { nickname } = req.body;
      try {
        const exists = await User.exists({ nickname });
        if (exists) {
          return res.sendStatus(400);
        }
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async putNickname(req, res, next) {
      const {
        session: {
          user: { _id },
        },
        body: { nickname },
      } = req;

      try {
        const exists = await User.exists({ nickname });
        if (exists) {
          return res.sendStatus(400);
        }
        req.session.user = await User.findByIdAndUpdate(
          _id,
          { nickname },
          { new: true }
        );
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async subscribeChannel(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      // 본인이 본인을 구독할 수는 없음
      if (id === user._id) {
        return res.sendStatus(400);
      }

      let session;
      try {
        session = await mongoose.startSession();
        const [isSubscriber, isSubscribeUsers] = await Promise.all([
          Subscriber.exists({ owner: id, users: user._id }),
          SubscribeUser.exists({ owner: user._id, users: id }),
        ]);

        if (isSubscriber || isSubscribeUsers) {
          return res.sendStatus(400);
        }

        await session.withTransaction(async () => {
          await Promise.all([
            Subscriber.findOneAndUpdate(
              { owner: id },
              {
                $push: {
                  users: user._id,
                },
              }
            ),
            SubscribeUser.findOneAndUpdate(
              { owner: user._id },
              {
                $push: {
                  users: id,
                },
              }
            ),
          ]);
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async unsubscribeChannel(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      if (id === user._id) {
        res.sendStatus(400);
      }

      let session;
      try {
        session = await mongoose.startSession();
        const [isSubscriber, isSubscribeUsers] = await Promise.all([
          Subscriber.exists({ owner: id, users: user._id }),
          SubscribeUser.exists({ owner: user._id, users: id }),
        ]);

        if (!isSubscriber || !isSubscribeUsers) {
          return res.sendStatus(400);
        }

        await session.withTransaction(async () => {
          await Promise.all([
            Subscriber.findOneAndUpdate(
              { owner: id },
              {
                $pull: {
                  users: user._id,
                },
              }
            ),
            SubscribeUser.findOneAndUpdate(
              { owner: user._id },
              {
                $pull: {
                  users: id,
                },
              }
            ),
          ]);
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async postPlayUserVideo(req, res, next) {
      const {
        params: { id },
        session: { userVideo },
      } = req;

      if (userVideo && id === userVideo.id) {
        return res.sendStatus(200);
      }

      try {
        const startTime = new Date().getTime();
        const video = await UserVideo.findById(id);
        if (!video) {
          return res.sendStatus(400);
        }

        const userVideo = {
          id,
          startTime,
        };

        req.session.userVideo = userVideo;
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async putEndUserVideo(req, res, next) {
      const {
        params: { id },
        session: { userVideo },
      } = req;

      if (!userVideo || userVideo.id !== id) {
        return res.sendStatus(200);
      }

      try {
        const { startTime } = userVideo;
        const endTime = new Date().getTime();
        const interval = endTime - startTime;

        const video = await UserVideo.findById(id);
        if (!video) {
          return res.sendStatus(400);
        }

        if (video.duration_in_seconds / 2 > interval / 1000) {
          return res.sendStatus(403);
        }
        video.views += 1;
        await video.save();
        delete req.session.userVideo;
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async deleteUserVideo(req, res, next) {
      const {
        session: { user },
        params: { id },
      } = req;

      let session;
      try {
        session = await mongoose.startSession();
        const video = await UserVideo.findById(id).populate({
          path: "comments",
          populate: {
            path: "sub_comments",
            select: "owner",
          },
        });
        if (String(video.owner) !== String(user._id)) {
          return res.sendStatus(400);
        }

        const videoIdx = video.file_url.indexOf("videos");
        const thumbnailIdx = video.thumbnail_url.indexOf("videos");
        await Promise.all([
          awsModule.deleteFile(video.file_url.substring(videoIdx)),
          awsModule.deleteFile(video.thumbnail_url.substring(thumbnailIdx)),
        ]);

        await session.withTransaction(async () => {
          await mongooseQuery.deleteUserVideo(video, session);
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async postLikeVideo(req, res, next) {
      const {
        session: {
          user: { _id },
        },
        params: { id },
      } = req;

      try {
        const isLiked = await UserVideo.exists({
          _id: id,
          likes: _id,
        });

        if (isLiked) {
          return res.sendStatus(400);
        }

        await UserVideo.findByIdAndUpdate(id, {
          $push: { likes: _id },
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async postUnLikeVideo(req, res, next) {
      const {
        session: {
          user: { _id },
        },
        params: { id },
      } = req;

      try {
        const isLiked = await UserVideo.exists({
          _id: id,
          likes: _id,
        });

        if (!isLiked) {
          return res.sendStatus(400);
        }

        await UserVideo.findByIdAndUpdate(id, {
          $pull: { likes: _id },
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async postVideoComment(req, res, next) {
      const {
        session: {
          user,
          user: { _id },
        },
        body: { videoId, text },
      } = req;

      let session;
      try {
        session = await mongoose.startSession();
        const videoExists = await UserVideo.exists({ _id: videoId });
        if (!videoExists) {
          return res.sendStatus(400);
        }

        let comment;
        await session.withTransaction(async () => {
          comment = (
            await UserVideoComment.create(
              [
                {
                  text,
                  owner: _id,
                  video: videoId,
                },
              ],
              { session }
            )
          )[0];

          await Promise.all([
            User.findByIdAndUpdate(_id, {
              $push: { user_video_comments: comment._id },
            }),
            UserVideo.findByIdAndUpdate(videoId, {
              $push: { comments: comment._id },
            }),
          ]);
        });

        res.status(200).json({
          id: comment._id,
          userId: _id,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          createAt: comment.create_at,
        });
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async getScrollComments(req, res, next) {
      const {
        params: { id },
        query: { count },
        session: { user },
      } = req;

      try {
        const video = await UserVideo.findById(id, "comments", {
          populate: {
            path: "comments",
            select: "-video -likes -sub_comments",
            options: { sort: { create_at: -1 }, skip: 5 * count, limit: 5 },
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          },
        });
        if (!video) {
          return next();
        }

        const [commentLikeResults, subCommentResults] = await Promise.all([
          mongooseQuery.getUserVideoCommentLikeCount(video.comments),
          mongooseQuery.getUserVideoSubCommentCount(video.comments),
        ]);

        const commentInfo = {
          likeCounts: [],
          subCommentCounts: [],
          isLiked: [],
        };

        for (let i = 0; i < video.comments.length; ++i) {
          commentInfo.likeCounts.push(commentLikeResults[i]);
          commentInfo.subCommentCounts.push(subCommentResults[i]);
        }

        if (user) {
          const likePromises = [];
          for (const comment of video.comments) {
            likePromises.push(
              UserVideoComment.exists({
                _id: comment._id,
                likes: user._id,
              })
            );
          }
          const results = await Promise.all(likePromises);
          for (let i = 0; i < video.comments.length; ++i) {
            if (results[i]) {
              commentInfo.isLiked.push(true);
            } else {
              commentInfo.isLiked.push(false);
            }
          }
        } else {
          for (let i = 0; i < video.comments.length; ++i) {
            commentInfo.isLiked.push(false);
          }
        }

        return res.status(200).json({
          comments: video.comments,
          commentInfo,
        });
      } catch (error) {
        return next(error);
      }
    },

    async getScrollSideVideo(req, res, next) {
      const {
        query: { userId, videoId, count },
      } = req;

      try {
        const sideVideos = await UserVideo.find(
          { owner: userId, _id: { $ne: videoId } },
          "title thumbnail_url owner views create_at",
          {
            skip: count * 6,
            limit: 6,
            sort: { create_at: -1 },
            populate: { path: "owner", select: "nickname" },
          }
        );

        if (!sideVideos) {
          return res.sendStatus(400);
        }

        return res.status(200).json(sideVideos);
      } catch (error) {
        return next(error);
      }
    },

    async putVideoComment(req, res, next) {
      const {
        params: { id },
        session: { user },
        body: { text },
      } = req;

      try {
        const comment = await UserVideoComment.exists({
          _id: id,
          owner: user._id,
        });
        if (!comment) {
          return res.sendStatus(400);
        }

        await UserVideoComment.findByIdAndUpdate(id, {
          text,
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async deleteVideoComment(req, res, next) {
      const {
        params: { id },
        session: {
          user: { _id },
        },
      } = req;

      let session;
      try {
        session = await mongoose.startSession();
        const comment = await UserVideoComment.findById(id)
          .select("owner video sub_comments")
          .populate({ path: "sub_comments", select: "owner" });
        if (!comment) {
          return res.sendStatus(400);
        }

        if (String(comment.owner) !== String(_id)) {
          return res.sendStatus(400);
        }

        await session.withTransaction(async () => {
          await mongooseQuery.deleteComment(comment, session);
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async postVideoCommentLike(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const isLike = await UserVideoComment.exists({
          _id: id,
          likes: user._id,
        });

        if (isLike) {
          return res.sendStatus(400);
        }

        await UserVideoComment.findByIdAndUpdate(id, {
          $push: { likes: user._id },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async postVideoCommentUnlike(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const isLiked = await UserVideoComment.exists({
          _id: id,
          likes: user._id,
        });

        if (!isLiked) {
          return res.sendStatus(400);
        }

        await UserVideoComment.findByIdAndUpdate(id, {
          $pull: { likes: user._id },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async postVideoSubComment(req, res, next) {
      const {
        params: { id },
        body: { toUserId, text },
        session: {
          user,
          user: { _id },
        },
      } = req;

      let session;
      try {
        session = await mongoose.startSession();
        const exists = await UserVideoComment.exists({ _id: id });
        if (!exists) {
          return res.sendStatus(400);
        }

        let subComment;
        await session.withTransaction(async () => {
          const regex = /[0-9a-f]{24}/;
          if (regex.test(toUserId)) {
            const exists = await User.exists({ _id: toUserId });
            if (!exists) {
              await session.abortTransaction();
              return;
            }
            subComment = (
              await UserVideoSubComment.create(
                [
                  {
                    text,
                    to_user: toUserId,
                    comment: id,
                    owner: _id,
                  },
                ],
                { session }
              )
            )[0];
          } else {
            subComment = (
              await UserVideoSubComment.create(
                [
                  {
                    text,
                    comment: id,
                    owner: _id,
                  },
                ],
                { session }
              )
            )[0];
          }

          await Promise.all([
            User.findByIdAndUpdate(
              _id,
              {
                $push: { user_video_sub_comments: subComment._id },
              },
              { session }
            ),
            UserVideoComment.findByIdAndUpdate(
              id,
              {
                $push: { sub_comments: subComment._id },
              },
              { session }
            ),
          ]);
        });

        const resSubComment = {
          owner: {
            _id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
          },
          _id: subComment._id,
          create_at: subComment.create_at,
        };

        res.status(200).json(resSubComment);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async getVideoSubComment(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const comment = await UserVideoComment.findById(id, "sub_comments")
          .populate({
            path: "sub_comments",
            select: "-likes",
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          })
          .populate({
            path: "sub_comments",
            options: { sort: { create_at: 1 } },
            populate: {
              path: "to_user",
              select: "nickname",
            },
          });

        if (!comment) {
          return res.sendStatus(400);
        }

        let likeCounts;
        let isLikes;
        if (user) {
          [likeCounts, isLikes] = await Promise.all([
            mongooseQuery.getUserVideoSubCommentLikeCount(comment.sub_comments),
            mongooseQuery.isLikeUserVideoSubComments(
              user._id,
              comment.sub_comments
            ),
          ]);
        } else {
          likeCounts = await mongooseQuery.getUserVideoSubCommentLikeCount(
            comment.sub_comments
          );

          isLikes = new Array(likeCounts.length).fill(
            false,
            0,
            likeCounts.length
          );
        }

        return res
          .status(200)
          .json({ subComments: comment.sub_comments, likeCounts, isLikes });
      } catch (error) {
        return next(error);
      }
    },

    async postVideoSubCommentLike(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const isLike = await UserVideoSubComment.exists({
          _id: id,
          likes: user._id,
        });

        if (isLike) {
          return res.sendStatus(400);
        }

        await UserVideoSubComment.findByIdAndUpdate(id, {
          $push: { likes: user._id },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async deleteVideoSubCommentLike(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const isLike = await UserVideoSubComment.exists({
          _id: id,
          likes: user._id,
        });

        if (!isLike) {
          return res.sendStatus(400);
        }

        await UserVideoSubComment.findByIdAndUpdate(id, {
          $pull: { likes: user._id },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async putVideoSubComment(req, res, next) {
      const {
        params: { id },
        body: { text },
        session: { user },
      } = req;

      try {
        const exists = await UserVideoSubComment.exists({
          _id: id,
          owner: user._id,
        });
        if (!exists) {
          return res.sendStatus(400);
        }

        await UserVideoSubComment.findByIdAndUpdate(id, { text });
        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async deleteVideoSubComment(req, res, next) {
      const {
        params: { id },
      } = req;

      let session;
      try {
        session = await mongoose.startSession();
        const subComment = await UserVideoSubComment.findById(
          id,
          "comment owner"
        );
        if (!subComment) {
          return res.sendStatus(400);
        }

        await session.withTransaction(async () => {
          await Promise.all([
            User.findByIdAndUpdate(
              subComment.owner,
              {
                $pull: { user_video_sub_comments: id },
              },
              { session }
            ),
            UserVideoComment.findByIdAndUpdate(
              subComment.comment,
              {
                $pull: { sub_comments: id },
              },
              { session }
            ),
            UserVideoSubComment.findByIdAndDelete(id, { session }),
          ]);
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      } finally {
        await session.endSession();
      }
    },
  };

  return apiController;
})();

export default apiController;
