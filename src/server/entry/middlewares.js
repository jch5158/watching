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

export const alreadySetNicknameMiddleware = (req, res, next) => {
  const {
    session: { user },
  } = req;
  if (!user) {
    req.flash("warning", "잘못된 접근입니다.");
    return res.redirect("/");
  }

  const { nickname } = user;
  if (nickname) {
    req.flash("warning", "잘못된 접근입니다.");
    return res.redirect("/");
  }

  return next();
};

export const setNicknameMiddleware = (req, res, next) => {
  const {
    session: { user },
  } = req;
  if (!user) {
    return next();
  }

  if (
    req.path === "/users/logout" ||
    req.path === "/users/nickname/set" ||
    req.path === "/api/users/confirm-nickname"
  ) {
    return next();
  }

  console.log(req.session);
  const { nickname } = user;
  if (!nickname) {
    req.flash("warning", "닉네임을 설정해주세요");
    return res.redirect("/users/nickname/set");
  }
  return next();
};
