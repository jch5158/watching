import multer from "multer";
import { validationResult } from "express-validator";

const middlewares = (function () {
  const middlewares = {
    localsMiddleware(req, res, next) {
      res.locals.isLoggedIn = Boolean(req.session.isLoggedIn);
      res.locals.loggedInUser = req.session.user;
      return next();
    },

    error404Middleware(req, res, next) {
      return res.render("screens/root/error", {
        pageTitle: 404,
        status: 404,
        message: "페이지를 찾을 수 없습니다.",
      });
    },

    error500Middleware(err, req, res, next) {
      console.log(err);
      return res.render("screens/root/error", {
        pageTitle: 500,
        status: 500,
        message: "일시적으로 서버의 문제가 발생되었습니다.",
      });
    },

    uploadAvatarMiddleware: multer({
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
    }).single("avatar"),

    validateMiddleware(req, res, next) {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        req.flash("warning", "잘못된 요청입니다.");
        return res.status(400).redirect("/");
      }
      return next();
    },

    alreadySetNicknameMiddleware(req, res, next) {
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
    },

    setNicknameMiddleware(req, res, next) {
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
    },

    onlyLoginMiddleware(req, res, next) {
      const {
        session: { isLoggedIn },
      } = req;

      if (!isLoggedIn) {
        req.flash("warning", "로그인을 먼저 해주세요");
        return res.redirect("/");
      }

      return next();
    },

    onlyNotLoginMiddleware(req, res, next) {
      const {
        session: { user },
      } = req;

      if (user) {
        req.flash("warning", "로그아웃을 해주세요");
        return res.redirect("/");
      }

      next();
    },

    onlyNotSNSAccountMiddleware(req, res, next) {
      const {
        session: { user },
      } = req;

      if (!user) {
        req.flash("warning", "로그인을 먼저 해주세요");
        return res.redirect("/");
      }

      const { sns_account } = user;
      if (sns_account) {
        req.flash("warning", "SNS 계정은 접근이 불가합니다.");
        return res.redirect("/");
      }

      return next();
    },
  };

  return middlewares;
})();

export default middlewares;
