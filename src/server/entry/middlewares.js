import multer from "multer";

export const error404Middleware = (req, res, next) => {
  return res.render("screens/root/404", { pageTitle: 404 });
};

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 5242880, // 5MB
  },
});
