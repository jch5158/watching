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

const apiController = (function () {
  const apiController = {
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

      if (id === user._id) {
        return res.sendStatus(400);
      }

      try {
        const [isSubscriber, isSubscribeUsers] = await Promise.all([
          Subscriber.exists({ owner: id, users: user._id }),
          SubscribeUser.exists({ owner: user._id, users: id }),
        ]);

        if (isSubscriber || isSubscribeUsers) {
          return res.sendStatus(400);
        }

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

        res.sendStatus(200);
      } catch (error) {
        return next(error);
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

      try {
        const [isSubscriber, isSubscribeUsers] = await Promise.all([
          Subscriber.exists({ owner: id, users: user._id }),
          SubscribeUser.exists({ owner: user._id, users: id }),
        ]);

        if (!isSubscriber || !isSubscribeUsers) {
          return res.sendStatus(400);
        }

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

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async postPlayUserVideo(req, res, next) {
      const {
        params: { id },
      } = req;

      const {
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

      if (!userVideo) {
        return res.sendStatus(400);
      }

      if (userVideo.id !== id) {
        return res.sendStatus(400);
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
          user: { _id },
        },
        body: { videoId, text },
      } = req;

      try {
        const videoExists = await UserVideo.exists({ _id: videoId });
        if (!videoExists) {
          return res.sendStatus(400);
        }

        const comment = await UserVideoComment.create({
          text,
          owner: _id,
          video: videoId,
        });

        await Promise.all([
          User.findByIdAndUpdate(_id, {
            $push: { user_video_comments: comment._id },
          }),
          UserVideo.findByIdAndUpdate(videoId, {
            $push: { comments: comment._id },
          }),
        ]);

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async putVideoComment(req, res, next) {},

    async deleteVideoComment(req, res, next) {},

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
          console.log(isLiked);
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
          user: { _id },
        },
      } = req;

      console.log("Asdf");

      try {
        const exists = await UserVideoComment.exists({ _id: id });
        if (!exists) {
          return res.sendStatus(400);
        }

        let subComment;
        const regex = /[0-9a-f]{24}/;
        if (regex.test(toUserId)) {
          console.log("태그 댓글 테스트");
          subComment = await UserVideoSubComment.create({
            text,
            to_user: toUserId,
            comment: id,
            owner: _id,
          });
        } else {
          subComment = await UserVideoSubComment.create({
            text,
            comment: id,
            owner: _id,
          });
        }

        await UserVideoComment.findByIdAndUpdate(id, {
          $push: { sub_comments: subComment._id },
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },

    async getVideoSubComment(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const comment = await UserVideoComment.findById(id)
          .select("sub_comments")
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
            populate: {
              path: "to_user",
              select: "nickname",
            },
          });

        if (!comment) {
          return res.sendStatus(400);
        }

        const [likeCounts, isLikes] = await Promise.all([
          mongooseQuery.getUserVideoSubCommentLikeCount(comment.sub_comments),
          mongooseQuery.isLikeUserVideoSubComments(
            user._id,
            comment.sub_comments
          ),
        ]);

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
  };

  return apiController;
})();

export default apiController;
