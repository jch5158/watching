import User from "../models/User";
import redisClient from "../entry/initRedis";
import bcrypt from "bcrypt";
import kakaoLogin from "../modules/kakaoLogin";
import githubLogin from "../modules/githubLogin";
import { fileExistsAndRemove } from "../modules/fileSystem";

const userController = (() => {
  const loginTitle = "Login";
  const joinTitle = "Join";
  const editProfileTitle = "Edit Profile";
  const editPasswordTitle = "Edit Password";
  const editNicknameTitle = "Edit Nickname";
  const profileTitle = "Profile";

  const joinTemplate = "screens/users/join";
  const loginTemplate = "screens/users/login";
  const setNicknameTemplate = "screens/users/set-nickname";
  const editProfileTemplate = "screens/users/edit-profile";
  const editPasswordTemplate = "screens/users/edit-password";
  const profileTemplate = "screens/users/profile";

  const joingSuccess = "회원가입 완료";
  const loginSuccess = "로그인 완료";
  const loginFailed = "로그인 실패";

  const userController = {
    getJoin(req, res) {
      res.render(joinTemplate, { pageTitle: joinTitle });
    },

    postJoin(req, res, next) {
      if (!req.fileExists) {
        req.flash("warning", "이미지 파일을 확인해주세요.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      }

      const {
        body: {
          name,
          email,
          nickname,
          password,
          password_confirm,
          authenticode,
          token,
        },
        file: { path },
      } = req;

      if (password !== password_confirm) {
        req.flash("warning", "패스워드가 일치하지 않습니다.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      }

      redisClient.get(
        `${email}/${authenticode}`,
        async (error, storedToken) => {
          if (error) {
            return next(error);
          }

          if (!storedToken) {
            req.flash("warning", "회원가입 제한 시간을 초과하였습니다.");
            return res
              .status(400)
              .render(joinTemplate, { pageTitle: joinTitle });
          } else if (token !== storedToken) {
            req.flash("warning", "입력 정보가 잘못되었습니다.");
            return res
              .status(400)
              .render(joinTemplate, { pageTitle: joinTitle });
          }

          try {
            const [emailExists, nicknameExists] = await Promise.all([
              User.exists({ email }),
              User.exists({ nickname }),
            ]);

            if (emailExists) {
              // 이메일이 중복됩니다.
              req.flash("warning", "사용중인 이메일입니다.");
              return res
                .status(400)
                .render(joinTemplate, { pageTitle: joinTitle });
            }

            if (nicknameExists) {
              // 닉네임이 중복됩니다.
              req.flash("warning", "사용중인 닉네임입니다.");
              return res
                .status(400)
                .render(joinTemplate, { pageTitle: joinTitle });
            }

            await User.create({
              name,
              email,
              nickname,
              password,
              avatar_url: path,
            });

            redisClient.del(`${email}/${authenticode}`, (error, result) => {
              if (error) {
                return next(error);
              }
            });
            req.flash("success", joingSuccess);
            return res.redirect("/users/login");
          } catch (error) {
            return next(error);
          }
        }
      );
    },

    getLogin(req, res) {
      return res.render(loginTemplate, { pageTitle: loginTitle });
    },

    async postLogin(req, res, next) {
      const {
        body: { email, password },
      } = req;

      try {
        const user = await User.findOne({ email });
        if (!user) {
          req.flash("warning", "일치하는 회원 정보가 없습니다.");
          return res
            .status(400)
            .render(loginTemplate, { pageTitle: loginTitle });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
          req.flash("warning", "일치하는 회원 정보가 없습니다.");
          return res
            .status(400)
            .render(loginTemplate, { pageTitle: loginTitle });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        req.flash("success", loginSuccess);
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },

    async getLogout(req, res, next) {
      try {
        await req.session.destroy();
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },

    getStartKakaoLogin(req, res) {
      const loginUri = kakaoLogin.getKakaoLoginRedirectUri();
      return res.redirect(loginUri);
    },

    async getFinishKakaoLogin(req, res, next) {
      const { code } = req.query;

      try {
        const access_token = await kakaoLogin.getKakaoAccessToken(code);
        if (!access_token) {
          req.flash("warning", loginFailed);
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        const userData = await kakaoLogin.getKakaoUserData(access_token);
        if (!userData) {
          req.flash("warning", loginFailed);
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        const {
          kakao_account,
          kakao_account: { profile },
        } = userData;

        if (
          !(
            kakao_account.has_email &&
            kakao_account.is_email_valid &&
            kakao_account.is_email_verified
          )
        ) {
          // Faild
          req.flash("warning", "등록된 이메일이 없습니다.");
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        let isOverlapNickname = false;
        let user = await User.findOne({ email: kakao_account.email });
        if (!user) {
          let nickname = "";
          user = await User.findOne({ nickname: profile.nickname });
          if (!user) {
            nickname = profile.nickname;
          } else {
            isOverlapNickname = true;
          }
          user = await User.create({
            name: profile.nickname,
            email: kakao_account.email,
            nickname,
            password: "",
            sns_account: true,
            avatar_url: profile.profile_image_url,
          });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        if (!isOverlapNickname) {
          req.flash("success", loginSuccess);
        }
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },

    getStartGithubLogin(req, res) {
      const loginUri = githubLogin.getGithubLoginRedirectUri();
      return res.redirect(loginUri);
    },

    async getFinishGithubLogin(req, res, next) {
      const { code } = req.query;

      try {
        const access_token = await githubLogin.getGithubAccessToken(code);
        if (!access_token) {
          req.flash("warning", loginFailed);
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        const userData = await githubLogin.getGithubUserData(access_token);
        if (!userData) {
          req.flash("warning", loginFailed);
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        const emailObj = await githubLogin.getGithubEmailData(access_token);
        if (!emailObj) {
          req.flash("warning", "등록된 이메일이 없습니다.");
          return res.render(loginTemplate, { pageTitle: loginTitle });
        }

        let isOverlapNickname = false;
        let user = await User.findOne({ email: emailObj.email });
        if (!user) {
          let nickname = "";
          user = await User.findOne({ nickname: userData.login });
          if (!user) {
            nickname = userData.login;
          } else {
            isOverlapNickname = true;
          }
          user = await User.create({
            name: userData.name,
            email: emailObj.email,
            nickname,
            password: "",
            sns_account: true,
            avatar_url: userData.avatar_url,
          });
        }

        req.session.isLoggedIn = true;
        req.session.user = user;
        if (!isOverlapNickname) {
          req.flash("success", loginSuccess);
        }
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },

    getSetUserNickname(req, res) {
      return res.render(setNicknameTemplate, {
        pageTitle: editNicknameTitle,
      });
    },

    async getProfile(req, res, next) {
      const { id } = req.params;
      try {
        const user = await User.findById(id);
        if (!user) {
          return next();
        }
        return res.render(profileTemplate, { pageTitle: profileTitle, user });
      } catch (error) {
        return next(error);
      }
    },

    getEditUserProfile(req, res) {
      return res.render(editProfileTemplate, { pageTitle: editProfileTitle });
    },

    async postEditUserProfile(req, res, next) {
      const {
        session: {
          user: { _id, avatar_url, nickname },
        },
        body: { newNickname },
        file,
      } = req;

      try {
        const path = file?.path;
        if (path && !avatar_url.startsWith("http")) {
          fileExistsAndRemove(avatar_url);
        }

        if (nickname !== newNickname) {
          const exists = await User.exists({ nickname: newNickname });
          if (exists) {
            req.flash("warning", "중복된 닉네임입니다.");
            return res
              .status(400)
              .render(editProfileTemplate, { pageTitle: editProfileTitle });
          }
        }

        req.session.user = await User.findByIdAndUpdate(
          _id,
          {
            nickname: nickname === newNickname ? nickname : newNickname,
            avatar_url: avatar_url === path ? avatar_url : path,
          },
          { new: true }
        );

        req.flash("success", "회원정보 수정 완료");
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },

    getEditPassword(req, res) {
      return res.render(editPasswordTemplate, {
        pageTitle: editPasswordTitle,
      });
    },

    async postEditPassword(req, res, next) {
      const {
        body: { password, new_password, new_password_confirm },
        session: {
          user: { _id },
        },
      } = req;

      try {
        const user = await User.findById(_id);
        if (!(await bcrypt.compare(password, user.password))) {
          req.flash("warning", "기존 비밀번호가 틀립니다.");
          return res.render(editPasswordTemplate, {
            pageTitle: editPasswordTitle,
          });
        }

        if (password === new_password) {
          req.flash("warning", "변경할 비밀번호가 동일합니다.");
          return res.render(editPasswordTemplate, {
            pageTitle: editPasswordTitle,
          });
        }

        if (new_password !== new_password_confirm) {
          req.flash("warning", "변경할 비밀번호가 일치하지 않습니다.");
          return res.render(editPasswordTemplate, {
            pageTitle: editPasswordTitle,
          });
        }

        user.password = new_password;
        await user.save();
        req.session.user.password = user.password;
        req.flash("success", "비밀번호 변경 완료");
        return res.redirect("/");
      } catch (error) {
        return next(error);
      }
    },
  };

  return userController;
})();

export default userController;
