import User from "../models/User";
import { webcrypto } from "crypto";
import redisClient from "../entry/initRedis";
import { sendAuthenticodeEmail } from "../modules/mailer";
import bcrypt from "bcrypt";
import {
  getKakaoLoginRedirectUri,
  getKakaoAccessToken,
  getKakaoUserData,
} from "../modules/kakaoLogin";
import {
  getGithubLoginRedirectUri,
  getGithubAccessToken,
  getGithubUserData,
  getGithubEmailData,
} from "../modules/githubLogin";

const joinTemplate = "screens/users/join";
const loginTemplate = "screens/users/login";

const joinTitle = "회원가입";
const loginTitle = "로그인";

const joingSuccess = "회원가입 완료";
const loginSuccess = "로그인 완료";
const loginFailed = "로그인 실패";

const getRandToken = (length) => {
  const array = webcrypto.getRandomValues(new Uint16Array(length));
  let authenticode = "";
  for (let i = 0; i < length; ++i) {
    const number = array[i] % 36;
    authenticode += number.toString(36);
  }
  return authenticode.toUpperCase();
};

const error500 = (req, res) => {
  req.flash("error", "서버의 문제가 발생되었습니다");
  return res.status(500).render("screens/root/500", { pageTitle: "500" });
};

export const getJoin = (req, res) => {
  res.render("screens/users/join", { pageTitle: joinTitle });
};

export const postJoin = (req, res) => {
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
    file,
  } = req;

  if (
    !file ||
    (file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/jpeg" &&
      file.mimetype !== "image/png")
  ) {
    req.flash("warning", "이미지 파일을 확인해주세요.");
    return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
  }

  if (password !== password_confirm) {
    req.flash("warning", "패스워드가 일치하지 않습니다.");
    return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
  }

  redisClient.get(`${email}/${authenticode}`, async (error, storedToken) => {
    if (error) {
      console.log(error);
      return error500(req, res);
    } else {
      if (!storedToken) {
        req.flash("warning", "회원가입 제한 시간을 초과하였습니다.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      } else if (token !== storedToken) {
        req.flash("warning", "입력 정보가 잘못되었습니다.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      }

      try {
        const emailExists = await User.exists({ email });
        if (emailExists) {
          // 이메일이 중복됩니다.
          req.flash("warning", "사용중인 이메일입니다.");
          return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
        }

        const nicknameExists = await User.exists({ nickname });
        if (nicknameExists) {
          // 닉네임이 중복됩니다.
          req.flash("warning", "사용중인 닉네임입니다.");
          return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
        }

        await User.create({
          name,
          email,
          nickname,
          password,
          avatar_url: file.path,
        });

        redisClient.del(`${email}/${authenticode}`, (error, result) => {
          if (error) {
            console.log(error);
            return error500(req, res);
          }
        });
        req.flash("success", joingSuccess);
        return res.redirect("/users/login");
      } catch (error) {
        console.log(error);
        return error500(req, res);
      }
    }
  });
};

export const postAuthenticode = async (req, res) => {
  const { email } = req.body;

  const exists = await User.exists({ email });
  if (exists) {
    return res.status(400).json({ message: "이미 가입된 E-mail입니다." });
  }

  const authenticode = getRandToken(6);
  redisClient.setEx(email, 180, authenticode, async (error, result) => {
    if (error) {
      console.log(error);
      return error500(req, res);
    }

    await sendAuthenticodeEmail(email, authenticode);
    return res.sendStatus(200);
  });
};

export const postConfirmAuthenticode = (req, res) => {
  const {
    body: { email, authenticode },
  } = req;

  redisClient.get(email, (error, redisAuthenticode) => {
    if (error) {
      console.log(error);
      return error500(req, res);
    } else {
      if (String(authenticode) !== String(redisAuthenticode)) {
        return res.sendStatus(400);
      }

      redisClient.del(email, (error, result) => {
        if (error) {
          console.log(error);
          return error500(req, res);
        }
      });

      const token = getRandToken(10);
      redisClient.setEx(
        `${email}/${authenticode}`,
        1800,
        token,
        (error, result) => {
          if (error) {
            console.log(error);
            return error500(req, res);
          }
          return res.status(200).json({ token });
        }
      );
    }
  });
};

export const postConfirmNickname = async (req, res) => {
  const { nickname } = req.body;
  const exists = await User.exists({ nickname });
  if (exists) {
    return res.sendStatus(400);
  }
  return res.sendStatus(200);
};

export const getLogin = (req, res) => {
  return res.render(loginTemplate, { pageTitle: loginTitle });
};

export const postLogin = async (req, res) => {
  const accountNotFound = "일치하는 회원 정보가 없습니다.";
  const {
    body: { email, password },
  } = req;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("warning", accountNotFound);
      return res.status(400).render(loginTemplate, { pageTitle: loginTitle });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      req.flash("warning", accountNotFound);
      return res.status(400).render(loginTemplate, { pageTitle: loginTitle });
    }

    req.session.isLoggedIn = true;
    req.session.user = user;

    req.flash("success", loginSuccess);
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return error500(req, res);
  }
};

export const getLogout = async (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getStartKakaoLogin = async (req, res) => {
  const loginUri = getKakaoLoginRedirectUri();
  return res.redirect(loginUri);
};

export const getFinishKakaoLogin = async (req, res) => {
  const { code } = req.query;

  try {
    const access_token = await getKakaoAccessToken(code);
    if (!access_token) {
      req.flash("warning", loginFailed);
      return res.render(loginTemplate);
    }

    const userData = await getKakaoUserData(access_token);
    if (!userData) {
      req.flash("warning", loginFailed);
      return res.render(loginTemplate);
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
      return res.render(loginTemplate);
    }

    let isOverlapNickname = true;
    let user = await User.findOne({ email: kakao_account.email });
    if (!user) {
      let nickname = "";
      user = await User.findOne({ nickname: profile.nickname });
      if (!user) {
        isOverlapNickname = false;
        nickname = profile.nickname;
      }
      user = await User.create({
        name: profile.nickname,
        email: kakao_account.email,
        nickname,
        password: "",
        sns_account: true,
        avatar_url: profile.profile_image_url,
      });
      console.log(user);
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    if (!isOverlapNickname) {
      req.flash("success", loginSuccess);
    }
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return error500(req, res);
  }
};

export const getStartGithubLogin = (req, res) => {
  const loginUri = getGithubLoginRedirectUri();
  return res.redirect(loginUri);
};

export const getFinishGithubLogin = async (req, res) => {
  const { code } = req.query;

  try {
    const access_token = await getGithubAccessToken(code);
    if (!access_token) {
      req.flash("warning", loginFailed);
      return res.render(loginTemplate);
    }

    const userData = await getGithubUserData(access_token);
    if (!userData) {
      req.flash("warning", loginFailed);
      return res.render(loginTemplate);
    }

    const emailObj = await getGithubEmailData(access_token);
    if (!emailObj) {
      req.flash("warning", "등록된 이메일이 없습니다.");
      return res.render(loginTemplate);
    }

    let isOverlapNickname = true;
    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      let nickname = "";
      user = await User.findOne({ nickname: userData.login });
      if (!user) {
        isOverlapNickname = false;
        nickname = userData.login;
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
    console.log(error);
    return error500(req, res);
  }
};

export const getSetUserNickname = async (req, res) => {
  return res.render("screens/users/set-nickname", {
    pageTitle: "닉네임 설정",
  });
};

export const putNickname = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { nickname },
  } = req;

  try {
    const exists = await User.exists({ nickname });
    if (exists) {
      return res.sendStatus(400);
    }
    req.session.user = await User.findByIdAndUpdate(
      _id,
      { nickname },
      { new: true }
    );
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return error500(req, res);
  }
};
