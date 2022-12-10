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
  res.render("screens/users/join", { pageTitle: "회원가입" });
};

export const postJoin = async (req, res) => {
  const joinTemplate = "screens/users/join";

  const {
    body: { name, email, nickname, password, password_confirm, token },
    file,
  } = req;

  if (
    !validateName(name) ||
    !validateEmail(email) ||
    !validateNickname(nickname) ||
    !validatePassword(password) ||
    !validateImageFile(file) ||
    !validateToken(token)
  ) {
    return res.status(400).render(joinTemplate);
  }

  if (password !== password_confirm) {
    return res.status(400).render(joinTemplate);
  }

  try {
    const value = await redisClient.getDel(token);
    if (!value || email !== value) {
      // 토큰을 발행받지 못하고 회원가입을 하거나 email이 달라짐
      return res.status(400).render(joinTemplate);
    }

    const emailExists = await User.exists({ email });
    if (emailExists) {
      // 이메일이 중복됩니다.
      return res.status(400).render(joinTemplate);
    }

    const nicknameExists = await User.exists({ nickname });
    if (nicknameExists) {
      // 닉네임이 중복됩니다.
      return res.status(400).render(joinTemplate);
    }

    await User.create({
      name,
      email,
      nickname,
      password,
      avatar_url: file.path,
    });

    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
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
    return res.sendStatus(500);
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
    // 30분
    await redisClient.setEx(token, 1800, email);
    console.log(token);
    return res.status(200).json({ token });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const getLogin = (req, res) => {
  return res.render("screens/users/login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
  const {
    body: { email, password },
  } = req;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.sendStatus(400);
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.sendStatus(400);
    }

    req.session.isLoggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};

export const getLogout = async (req, res) => {
  req.session.destroy(() => {
    console.log("파괴 완료");
  });

  return res.redirect("/");
};
