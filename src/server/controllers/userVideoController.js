import User from "../models/User";
import UserVideo from "../models/UserVideo";
import Subscriber from "../models/Subscriber";
import fileSystem from "../modules/fileSystem";
import { getVideoDurationInSeconds } from "get-video-duration";
import UserVideoComment from "../models/UserVideoComment";
import mongoose, { mongo } from "mongoose";
import mongooseQuery from "../modules/mongooseQuery";
import awsModule from "../modules/awsModule";

const userVideoController = (() => {
  const homeTitle = "Home";
  const uploadTitle = "Upload Video";
  const editTitle = "Edit Video";

  const homeTemplate = "screens/root/home";
  const uploadTemplate = "screens/user-videos/upload";
  const watchTemplate = "screens/user-videos/watch";
  const editTemplate = "screens/user-videos/edit";

  const userVideoController = {
    async getHomeVideos(req, res, next) {
      try {
        const videos = await UserVideo.find(
          {},
          "title thumbnail_url views create_at",
          {
            limit: 12,
            sort: { create_at: -1 },
            populate: {
              path: "owner",
              select: "nickname avatar_url",
            },
          }
        );

        res.render(homeTemplate, { pageTitle: homeTitle, videos });
      } catch (error) {
        return next(error);
      }
    },

    async getSearchVideos(req, res, next) {
      let {
        query: { keyword },
      } = req;

      if (keyword.startsWith("#")) {
        keyword = keyword.substring(1);
      }

      try {
        const videos = await UserVideo.find(
          {
            $or: [
              { title: { $regex: new RegExp(`${keyword}`, "i") } },
              { hashtags: { $regex: new RegExp(`#${keyword}`, "i") } },
            ],
          },
          "title thumbnail_url views create_at",
          {
            limit: 12,
            sort: { create_at: -1 },
            populate: { path: "owner", select: "nickname avatar_url" },
          }
        );

        res.render(homeTemplate, { pageTitle: keyword, videos, keyword });
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

      let session;
      try {
        session = await mongoose.startSession();
        const duration = 10;
        console.log(duration);
        await session.withTransaction(async () => {
          const video = (
            await UserVideo.create(
              [
                {
                  title,
                  description,
                  file_url: userVideo[0].location,
                  thumbnail_url: thumbnail[0].location,
                  hashtags: UserVideo.formatHashtags(hashtags),
                  duration_in_seconds: duration,
                  owner: _id,
                },
              ],
              { session }
            )
          )[0];

          req.session.user = await User.findByIdAndUpdate(
            _id,
            {
              $push: { user_videos: video._id },
            },
            { new: true, session }
          );
        });

        req.flash("success", "비디오 업로드 성공");
        return res.redirect(`/users/${_id}`);
      } catch (error) {
        const videoIdx = userVideo[0].location.indexOf("videos");
        const thumbnailIdx = thumbnail[0].location.indexOf("videos");
        awsModule.deleteFile(userVideo[0].location.substring(videoIdx));
        awsModule.deleteFile(thumbnail[0].location.substring(thumbnailIdx));
        return next(error);
      } finally {
        await session.endSession();
      }
    },

    async getWatchVideo(req, res, next) {
      const {
        session: { user },
        params: { id },
      } = req;

      try {
        const video = await UserVideo.findById(
          id,
          "-duration_in_seconds -likes"
        )
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
          "title thumbnail_url owner views create_at",
          {
            limit: 6,
            sort: { create_at: -1 },
            populate: {
              path: "owner",
              select: "nickname",
            },
          }
        );
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

    async getEditVideo(req, res, next) {
      const {
        params: { id },
        session: { user },
      } = req;

      try {
        const video = await UserVideo.findById(id);
        if (!video) {
          req.flash("warning", "비디오가 조회되지 않습니다.");
          return next();
        }

        if (String(video.owner) !== String(user._id)) {
          req.flash("warning", "비디오를 수정할 수 없습니다.");
          return res.redirect("/");
        }

        res.render(editTemplate, {
          pageTitle: editTitle,
          video,
          userId: user._id,
        });
      } catch (error) {
        return next(error);
      }
    },

    async postEditVideo(req, res, next) {
      const {
        videoExists,
        thumbnailExists,
        params: { id },
        session: {
          user: { _id },
        },
        body: { title, description, hashtags },
        files,
      } = req;

      const { userVideo, thumbnail } = files;

      try {
        const video = await UserVideo.findById(id);
        if (!video) {
          req.flash("warning", "비디오가 존재하지 않습니다.");
          return next();
        }

        if (String(video.owner._id) !== String(_id)) {
          req.flash("warning", "비디오를 수정할 수 없습니다.");
          return res.redirect("/");
        }

        let updateVideo;
        if (videoExists) {
          updateVideo = userVideo[0].location;
          const idx = video.file_url.indexOf("videos");
          awsModule.deleteFile(video.file_url.substring(idx));
        } else {
          updateVideo = video.file_url;
        }

        let updateThumbnail;
        if (thumbnailExists) {
          updateThumbnail = thumbnail[0].location;
          const idx = video.thumbnail_url.indexOf("videos");
          awsModule.deleteFile(video.thumbnail_url.substring(idx));
        } else {
          updateThumbnail = video.thumbnail_url;
        }

        await UserVideo.findByIdAndUpdate(id, {
          title,
          description,
          hashtags: UserVideo.formatHashtags(hashtags),
          file_url: updateVideo,
          thumbnail_url: updateThumbnail,
        });

        req.flash("success", "비디오 수정 성공");
        return res.redirect(`/user-videos/${video._id}`);
      } catch (error) {
        return next(error);
      }
    },
  };
  return userVideoController;
})();

export default userVideoController;
