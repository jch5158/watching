import multer from "multer";
import { validationResult } from "express-validator";

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

export const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.sendStatus(400);
  }
  return next();
};
