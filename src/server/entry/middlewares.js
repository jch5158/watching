import multer from "multer";
import { validationResult } from "express-validator";

export const localsMiddleware = (req, res, next) => {
  res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
  res.locals.loggedInUser = req.session.user;
  return next();
};

export const error404Middleware = (req, res, next) => {
  return res.render("screens/root/404", {
    pageTitle: 404,
    status: 404,
    message: "페이지를 찾을 수 없습니다.",
  });
};

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (
      file &&
      (file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png")
    ) {
      req.fileValidate = true;
      cb(null, true);
    } else {
      req.fileInvalidateMsg = "jpg, jpeg, png 형식이 아닙니다.";
      cb(null, false);
    }
  },
}).single("avatar");

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
    return res.status(400).redirect("/");
  }

  const { nickname } = user;
  if (nickname) {
    req.flash("warning", "잘못된 접근입니다.");
    return res.status(400).redirect("/");
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
    req.path === "/users/nickname" ||
    req.path === "/api/users/nickname"
  ) {
    return next();
  }

  const { nickname } = user;
  if (!nickname) {
    req.flash("warning", "닉네임을 설정해주세요");
    return res.redirect("/users/nickname");
  }
  return next();
};
