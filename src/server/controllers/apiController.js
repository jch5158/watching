import User from "../models/User";
import UserVideo from "../models/UserVideo";
import redisClient from "../entry/initRedis";
import { createRandToken } from "../modules/common";
import { sendAuthenticodeEmail } from "../modules/mailer";

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
        const video = await UserVideo.findById(id)
          .populate({
            path: "likes",
            populate: {
              path: "users",
              select: "_id",
              match: { _id },
            },
          })
          .select("likes");

        if (video.likes.users.length !== 0) {
          return res.sendStatus(400);
        }

        await UserVideo.findByIdAndUpdate(id, {
          $push: { "likes.users": _id },
          $inc: { "likes.count": 1 },
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
        const video = await UserVideo.findById(id)
          .populate({
            path: "likes",
            populate: {
              path: "users",
              select: "_id",
              match: { _id },
            },
          })
          .select("likes");

        if (video.likes.users.length === 0) {
          return res.sendStatus(400);
        }

        await UserVideo.findByIdAndUpdate(id, {
          $pull: { "likes.users": _id },
          $inc: { "likes.count": -1 },
        });

        res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  };

  return apiController;
})();

export default apiController;
