import mongoose from "mongoose";
import UserVideoComment from "../models/UserVideoComment";
import UserVideoSubComment from "../models/UserVideoSubComment";
import User from "../models/User";
import UserVideo from "../models/UserVideo";

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

    async deleteComment(comment, session) {
      const promises = [];
      for (let sub_comment of comment.sub_comments) {
        promises.push(
          User.findByIdAndUpdate(
            sub_comment.owner,
            {
              $pull: { user_video_sub_comments: sub_comment._id },
            },
            { session }
          )
        );
        promises.push(
          UserVideoSubComment.findByIdAndDelete(sub_comment._id, { session })
        );
      }

      promises.push(
        UserVideoComment.findByIdAndDelete(comment._id, { session })
      );
      promises.push(
        User.findByIdAndUpdate(
          String(comment.owner),
          {
            $pull: { user_video_comments: String(comment._id) },
          },
          { session }
        )
      );

      promises.push(
        UserVideo.findByIdAndUpdate(
          comment.video,
          {
            $pull: { comments: comment._id },
          },
          { session }
        )
      );

      return Promise.all(promises);
    },

    async deleteUserVideo(video, session) {
      const promises = [];
      for (let comment of video.comments) {
        promises.push(this.deleteComment(comment, session));
      }
      promises.push(
        User.findByIdAndUpdate(
          video.owner,
          {
            $pull: { user_videos: video._id },
          },
          { session }
        )
      );
      promises.push(UserVideo.findByIdAndDelete(video._id, { session }));
      return Promise.all(promises);
    },
  };

  return mongooseQuery;
})();

export default mongooseQuery;
