import multer from "multer";

export const localsMiddleware = (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
  res.locals.loggedInUser = req.session.user;
  return next();
};

export const error404Middleware = (req, res, next) => {
  return res.render("screens/root/404", { pageTitle: 404 });
};

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 5242880, // 5MB
  },
});
