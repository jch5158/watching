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
import { fileExistsAndRemove } from "../modules/fileSystem";
import flash from "express-flash";

const joinTemplate = "screens/users/join";
const loginTemplate = "screens/users/login";

const joinTitle = "Join";
const loginTitle = "Login";
const editPasswordTitle = "Edit Password";

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

export const getJoin = (req, res) => {
  res.render("screens/users/join", { pageTitle: joinTitle });
};

export const postJoin = (req, res) => {
  if (!req.fileValidate) {
    req.flash("warning", "이미지 파일을 확인해주세요.");
    return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
  } else if (req.fileInvalidateMsg) {
    req.flash("warning", req.fileInvalidateMsg);
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

  redisClient.get(`${email}/${authenticode}`, async (error, storedToken) => {
    if (error) {
      throw error;
    } else {
      if (!storedToken) {
        req.flash("warning", "회원가입 제한 시간을 초과하였습니다.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      } else if (token !== storedToken) {
        req.flash("warning", "입력 정보가 잘못되었습니다.");
        return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
      }

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
        avatar_url: path,
      });

      redisClient.del(`${email}/${authenticode}`, (error, result) => {
        if (error) {
          throw error;
        }
      });
      req.flash("success", joingSuccess);
      return res.redirect("/users/login");
    }
  });
};

export const sendAuthenticodeByEmail = async (req, res) => {
  const { email } = req.query;
  const exists = await User.exists({ email });
  if (exists) {
    return res.sendStatus(400);
  }
  const authenticode = getRandToken(6);
  redisClient.setEx(email, 180, authenticode, async (error, result) => {
    if (error) {
      throw error;
    }
    await sendAuthenticodeEmail(email, authenticode);
    return res.sendStatus(200);
  });
};

export const confirmAuthenticode = (req, res) => {
  const {
    body: { email, authenticode },
  } = req;

  redisClient.get(email, (error, redisAuthenticode) => {
    if (error) {
      throw error;
    } else {
      if (String(authenticode) !== String(redisAuthenticode)) {
        return res.sendStatus(400);
      }

      redisClient.del(email, (error, result) => {
        if (error) {
          throw error;
        }
      });

      const token = getRandToken(10);
      redisClient.setEx(
        `${email}/${authenticode}`,
        1800,
        token,
        (error, result) => {
          if (error) {
            throw error;
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
    console.log(user);
  }

  req.session.isLoggedIn = true;
  req.session.user = user;
  if (!isOverlapNickname) {
    req.flash("success", loginSuccess);
  }
  return res.redirect("/");
};

export const getStartGithubLogin = (req, res) => {
  const loginUri = getGithubLoginRedirectUri();
  return res.redirect(loginUri);
};

export const getFinishGithubLogin = async (req, res) => {
  const { code } = req.query;

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
};

export const userProfile = async (req, res) => {
  return res.send("Hello World");
};

export const getEditUserProfile = (req, res) => {
  return res.render("screens/users/edit-profile", { pageTitle: "Edit" });
};

export const postEditUserProfile = async (req, res, next) => {
  if (req.fileInvalidateMsg) {
    req.flash("warning", req.fileInvalidateMsg);
    return res.status(400).redirect("/");
  }

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
      console.log(newNickname);
      const exists = await User.exists({ nickname: newNickname });
      if (exists) {
        req.flash("warning", "중복된 닉네임입니다.");
        return res.status(400).redirect("/");
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
    next(error);
  }
};

export const getEditPassword = (req, res) => {
  return res.render("screens/users/edit-password", {
    pageTitle: editPasswordTitle,
  });
};

export const postEditPassword = async (req, res, next) => {
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
      return res.render("screens/users/edit-password", {
        pageTitle: editPasswordTitle,
      });
    }

    if (password === new_password) {
      req.flash("warning", "변경할 비밀번호가 동일합니다.");
      return res.render("screens/users/edit-password", {
        pageTitle: editPasswordTitle,
      });
    }

    if (new_password !== new_password_confirm) {
      req.flash("warning", "변경할 비밀번호가 일치하지 않습니다.");
      return res.render("screens/users/edit-password", {
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
};
