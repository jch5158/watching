import User from "../models/User";
import UserVideo from "../models/UserVideo";
import Subscriber from "../models/Subscriber";
import fileSystem from "../modules/fileSystem";
import { getVideoDurationInSeconds } from "get-video-duration";
import UserVideoComment from "../models/UserVideoComment";
import mongoose from "mongoose";
import mongooseQuery from "../modules/mongooseQuery";

const userVideoController = (() => {
  const homeTitle = "Home";
  const uploadTitle = "Upload Video";

  const homeTemplate = "screens/root/home";
  const uploadTemplate = "screens/user-videos/upload";
  const watchTemplate = "screens/user-videos/watch";

  const userVideoController = {
    async getHomeVideos(req, res, next) {
      try {
        const videos = await UserVideo.find()
          .sort({ create_at: "desc" })
          .populate({ path: "owner", select: "nickname avatar_url" })
          .limit(12);

        res.render(homeTemplate, { pageTitle: homeTitle, videos });
      } catch (error) {
        return next(error);
      }
    },

    getUploadVideo(req, res) {
      res.render(uploadTemplate, { pageTitle: uploadTitle });
    },

    async postUploadVideo(req, res, next) {
      const {
        videoExists,
        thumbnailExists,
        session: {
          user: { _id },
        },
        body: { title, description, hashtags },
        files,
      } = req;

      if (!videoExists) {
        req.flash("warning", "비디오 파일이 없습니다.");
        return res.render(uploadTemplate, { pageTitle: uploadTitle });
      }
      if (!thumbnailExists) {
        req.flash("warning", "비디오 이미지가 없습니다.");
        return res.render(uploadTemplate, { pageTitle: uploadTitle });
      }
      const { userVideo, thumbnail } = files;
      try {
        const user = await User.exists({ _id });
        if (!user) {
          throw new Error("User가 조회되지 않습니다.");
        }
        const duration = await getVideoDurationInSeconds(userVideo[0].path);
        const video = await UserVideo.create({
          title,
          description,
          file_url: userVideo[0].path,
          thumbnail_url: thumbnail[0].path,
          hashtags: UserVideo.formatHashtags(hashtags),
          duration_in_seconds: duration,
          owner: _id,
        });

        await User.findByIdAndUpdate(_id, {
          $push: { user_videos: video._id },
        });
        video.save(), req.flash("success", "비디오 업로드 성공");
        return res.redirect(`/users/${_id}`);
      } catch (error) {
        fileSystem.fileExistsAndRemove(userVideo[0].path);
        fileSystem.fileExistsAndRemove(thumbnail[0].path);
        return next(error);
      }
    },

    async getWatchVideo(req, res, next) {
      const {
        session: { user },
        params: { id },
      } = req;

      try {
        const video = await UserVideo.findById(id)
          .select("-duration_in_seconds -likes")
          .populate({
            path: "owner",
            select: "nickname avatar_url subscribers",
          })
          .populate({
            path: "comments",
            select: "-video -likes -sub_comments",
            options: { sort: { create_at: -1 }, limit: 5 },
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          });

        if (!video) {
          return next();
        }

        const [likeInfo, subscriberInfo] = await Promise.all([
          await UserVideo.aggregate([
            {
              $match: {
                _id: mongoose.Types.ObjectId(video._id),
              },
            },
            { $project: { length: { $size: "$likes" } } },
          ]),
          await Subscriber.aggregate([
            {
              $match: {
                _id: mongoose.Types.ObjectId(video.owner.subscribers),
              },
            },
            {
              $project: { length: { $size: "$users" } },
            },
          ]),
        ]);

        video.likeCount = likeInfo[0].length;
        video.owner.subscriberCount = subscriberInfo[0].length;

        const [commentLikeResults, subCommentResults] = await Promise.all([
          mongooseQuery.getUserVideoCommentLikeCount(video.comments),
          mongooseQuery.getUserVideoSubCommentCount(video.comments),
        ]);

        for (let i = 0; i < video.comments.length; ++i) {
          video.comments[i].likeCount = commentLikeResults[i];
          video.comments[i].subCount = subCommentResults[i];
        }

        let isLiked = false;
        let isSubscribed = false;
        if (user) {
          isLiked = (await UserVideo.exists({
            _id: id,
            likes: user._id,
          }))
            ? true
            : false;

          if (String(video.owner._id) !== String(user._id)) {
            isSubscribed = (await Subscriber.exists({
              _id: video.owner.subscribers._id,
              users: user._id,
            }))
              ? true
              : false;
          }

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
              video.comments[i].isLiked = true;
            } else {
              video.comments[i].isLiked = false;
            }
          }
        }

        const sideVideos = await UserVideo.find(
          {
            owner: video.owner._id,
            _id: { $ne: id },
          },

          "title thumbnail_url owner views create_at"
        )
          .limit(6)
          .populate({ path: "owner", select: "nickname" });
        if (!sideVideos) {
          return next();
        }

        res.render(watchTemplate, {
          pageTitle: `${video.title}`,
          video,
          sideVideos,
          isLiked,
          isSubscribed,
        });
      } catch (error) {
        next(error);
      }
    },
  };
  return userVideoController;
})();

export default userVideoController;
