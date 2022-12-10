import User from "../models/User";
import { webcrypto } from "crypto";
import redisClient from "../entry/initRedis";
import { sendAuthenticodeEmail } from "../modules/mailer";
import bcrypt from "bcrypt";
import {
  validateName,
  validateEmail,
  validateNickname,
  validatePassword,
  validateImageFile,
  validateAuthenticode,
  validateToken,
} from "../validators/users/userValidator";

const joinTemplate = "screens/users/join";
const loginTemplate = "screens/users/login";
const error500Template = "screens/root/500";

const joinTitle = "회원가입";
const loginTitle = "로그인";
const error500Title = "500";

const serverErrorMsg = "서버의 문제가 발생되었습니다";

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

export const postJoin = async (req, res) => {
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
    !validateName(name) ||
    !validateEmail(email) ||
    !validateNickname(nickname) ||
    !validatePassword(password) ||
    !validateImageFile(file) ||
    !validateAuthenticode(authenticode) ||
    !validateToken(token)
  ) {
    req.flash("warning", "입력 정보가 잘못되었습니다.");
    return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
  }

  if (password !== password_confirm) {
    req.flash("warning", "패스워드가 일치하지 않습니다.");
    return res.status(400).render(joinTemplate, { pageTitle: joinTitle });
  }

  try {
    const storedToken = await redisClient.getDel(`${email}/${authenticode}`);
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
      avatar_url: file.path,
    });

    req.flash("success", "회원가입 완료");
    return res.redirect("/users/login");
  } catch (error) {
    console.log(error);
    req.flash("error", serverErrorMsg);
    return res
      .status(500)
      .render(error500Template, { pageTitle: error500Title });
  }
};

export const postAuthenticode = async (req, res) => {
  const email = req.body;
  if (!validateEmail(email)) {
    return res.sendStatus(400);
  }

  const authenticode = getRandToken(6);

  try {
    await redisClient.setEx(email, 180, authenticode);
    await sendAuthenticodeEmail(email, authenticode);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    req.flash("error", serverErrorMsg);
    return res
      .status(500)
      .render(error500Template, { pageTitle: error500Title });
  }
};

export const postConfirmAuthenticode = async (req, res) => {
  const {
    body: { email, authenticode },
  } = req;

  if (!validateEmail(email)) {
    return res.sendStatus(400);
  }

  if (!validateAuthenticode(authenticode)) {
    return res.sendStatus(400);
  }

  try {
    const redisAuthenticode = await redisClient.get(email);
    if (String(authenticode) !== String(redisAuthenticode)) {
      return res.sendStatus(400);
    }
    await redisClient.del(email);
    const token = getRandToken(10);
    await redisClient.setEx(`${email}/${authenticode}`, 1800, token); // 30분
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    req.flash("error", serverErrorMsg);
    return res
      .status(500)
      .render(error500Template, { pageTitle: error500Title });
  }
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

    req.flash("success", "로그인 완료");
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .render(error500Template, { pageTitle: error500Title });
  }
};

export const getLogout = async (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
