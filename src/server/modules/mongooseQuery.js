import mongoose from "mongoose";
import UserVideoComment from "../models/UserVideoComment";
import UserVideoSubComment from "../models/UserVideoSubComment";

const mongooseQuery = (() => {
  const mongooseQuery = {
    async getUserVideoCommentLikeCount(comments) {
      const promises = [];
      for (let comment of comments) {
        promises.push(
          UserVideoComment.aggregate([
            {
              $match: {
                _id: mongoose.Types.ObjectId(comment._id),
              },
            },
            {
              $project: { count: { $size: "$likes" } },
            },
          ])
        );
      }

      const counts = [];
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; ++i) {
        counts.push(results[i][0].count);
      }
      return counts;
    },

    async getUserVideoSubCommentCount(comments) {
      const promises = [];
      for (let comment of comments) {
        promises.push(
          UserVideoComment.aggregate([
            {
              $match: {
                _id: mongoose.Types.ObjectId(comment._id),
              },
            },
            {
              $project: { count: { $size: "$sub_comments" } },
            },
          ])
        );
      }

      const counts = [];
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; ++i) {
        counts.push(results[i][0].count);
      }
      return counts;
    },

    async getUserVideoSubCommentLikeCount(subComments) {
      const promises = [];
      for (let subComment of subComments) {
        promises.push(
          UserVideoSubComment.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(subComment._id) } },
            { $project: { count: { $size: "$likes" } } },
          ])
        );
      }

      const counts = [];
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; ++i) {
        counts.push(results[i][0].count);
      }
      return counts;
    },

    async isLikeUserVideoSubComments(userId, subComments) {
      const promises = [];
      for (let subComment of subComments) {
        promises.push(
          UserVideoSubComment.exists({
            _id: subComment._id,
            likes: userId,
          })
        );
      }

      const isLikes = [];
      const results = await Promise.all(promises);
      for (let i = 0; i < results.length; ++i) {
        if (results[i]) {
          isLikes.push(true);
        } else {
          isLikes.push(false);
        }
      }

      return isLikes;
    },
  };

  return mongooseQuery;
})();

export default mongooseQuery;
