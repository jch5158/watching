import User from "../models/User";
import nodemailer from "nodemailer";
import { pugEngine } from "nodemailer-pug-engine";
import { webcrypto } from "crypto";
import redisClient from "../entry/initRedis";

const transporter = nodemailer.createTransport({
  serviec: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_SERVER_ID,
    pass: process.env.SMTP_SERVER_PASS,
  },
});

transporter.use(
  "compile",
  pugEngine({
    templateDir: `${process.cwd()}/src/client/views/screens/mails`,
  })
);

const getEmailAuthenticode = () => {
  const array = webcrypto.getRandomValues(new Uint8Array(6));
  return array
    .map((num) => num % 10)
    .toString()
    .replaceAll(",", "");
};

const sendEmail = async (data) => {
  await transporter.sendMail(data, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      return info.response;
    }
  });
};

const validateName = (name) => {
  // 한글 2자 이상 15자 이하 허용
  const regExp = /^[가-힣]{2,20}$/;
  return regExp.test(name);
};

const validateEmail = (email) => {
  if (!email || email.length < 5 || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
};

const validateNickname = (nickname) => {
  //- 2자 이상 15자 이하, 영어 또는 숫자 또는 한글로 구성
  //* 특이사항 : 한글 초성 및 모음은 허가하지 않는다.
  const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
  return regExp.test(nickname);
};

const validatePassword = (password, passwordConfirm) => {
  if (password !== passwordConfirm) {
    return false;
  }

  //최소 8자 + 최대 15자 + 최소 한개의 소문자 + 최소 한개의 대문자 + 최소 한개의 숫자 + 최소 한개의 특수 문자
  const regExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

  return regExp.test(password);
};

const validateImageFile = (file) => {
  if (!file) {
    return false;
  }

  if (
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/jpeg" &&
    file.mimetype !== "image/png"
  ) {
    return false;
  }

  return true;
};

export const getJoin = (req, res) => {
  res.render("screens/users/join", { pageTitle: "회원가입" });
};

export const postJoin = async (req, res) => {
  const joinTemplate = "screens/users/join";

  const {
    body: { name, email, nickname, password, password_confirm },
    file,
  } = req;

  if (
    !validateName(name) ||
    !validateEmail(email) ||
    !validateNickname(nickname) ||
    !validatePassword(password, password_confirm) ||
    !validateImageFile(file)
  ) {
    return res.status(400).render(joinTemplate);
  }

  try {
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
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.redirect("/");
};

export const postEmailAuthenticode = async (req, res) => {
  const email = req.body;
  if (!validateEmail(email)) {
    return res.sendStatus(400);
  }
  const authenticode = getEmailAuthenticode();
  const data = {
    to: email,
    subject: "이메일 인증번호입니다.",
    template: "mail-authentication",
    ctx: {
      code: authenticode,
    },
  };

  try {
    await redisClient.setEx(email, 180, authenticode);
    sendEmail(data);
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
