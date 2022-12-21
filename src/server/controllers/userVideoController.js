import UserVideo from "../models/UserVideo";

const userVideoController = (() => {
  const uploadTitle = "Upload Video";

  const uploadTemplate = "screens/user-videos/upload";

  const userVideoController = {
    getUploadVideo(req, res) {
      res.render(uploadTemplate, { pageTitle: uploadTitle });
    },
    async postUploadVideo(req, res, next) {
      const {
        videoExists,
        thumbnailExists,
        session: { user },
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
        await UserVideo.create({
          title,
          description,
          file_url: userVideo[0].path,
          thumbnail_url: thumbnail[0].path,
          hashtags: UserVideo.formatHashtags(hashtags),
        });

        req.flash("success", "비디오 업로드 성공");
        return res.redirect(`/users/${user._id}`);
      } catch (error) {
        return next(error);
      }
    },
  };
  return userVideoController;
})();

export default userVideoController;
