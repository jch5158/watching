import User from "../models/User";
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
  };

  return apiController;
})();

export default apiController;
