import User from "../models/User";
import UserVideo from "../models/UserVideo";
import fileSystem from "../modules/fileSystem";

const userVideoController = (() => {
  const homeTitle = "Home";
  const uploadTitle = "Upload Video";

  const homeTemplate = "screens/root/home";
  const uploadTemplate = "screens/user-videos/upload";

  const userVideoController = {
    async getHomeVideos(req, res, next) {
      try {
        const videos = await UserVideo.find()
          .sort({ createAt: "desc" })
          .populate("owner");

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
        const user = await User.findById(_id);
        if (!user) {
          throw new Error("User가 조회되지 않습니다.");
        }

        const video = await UserVideo.create({
          title,
          description,
          file_url: userVideo[0].path,
          thumbnail_url: thumbnail[0].path,
          hashtags: UserVideo.formatHashtags(hashtags),
          owner: _id,
        });

        user.user_videos.push(video._id);
        user.save();
        req.flash("success", "비디오 업로드 성공");
        return res.redirect(`/users/${_id}`);
      } catch (error) {
        fileSystem.fileExistsAndRemove(userVideo[0].path);
        fileSystem.fileExistsAndRemove(thumbnail[0].path);
        return next(error);
      }
    },
  };
  return userVideoController;
})();

export default userVideoController;
