import nodemailer from "nodemailer";
import { pugEngine } from "nodemailer-pug-engine";

const transporter = nodemailer.createTransport({
  serviec: process.env.SMTP_SERVICE_NAME,
  host: process.env.SMTP_SERVER_HOST,
  port: process.env.SMTP_SERVER_PORT,
  // TLS를 이용해서 이메일 통신 암호화
  secure: true,
  auth: {
    user: process.env.SMTP_SERVER_ID,
    pass: process.env.SMTP_SERVER_PASS,
  },
});

transporter.use(
  "compile",
  pugEngine({
    templateDir: `${process.cwd()}/src/client/views/screens`,
  })
);

export const sendAuthenticodeEmail = async (email, authenticode) => {
  const data = {
    to: email,
    subject: "이메일 인증번호입니다.",
    template: "mails/mail-authenticode",
    ctx: {
      code: authenticode,
    },
  };

  await transporter.sendMail(data, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(info.response);
    }
  });
};
