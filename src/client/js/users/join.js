const sendCodeBtn = document.querySelector(".login-form__send-code");
const emailInfo = document.querySelector(".login-form__email");

const validateEmail = (email) => {
  if (!email || email.length < 5 || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
};
const sendEmailCode = async () => {
  const email = emailInfo.value;
  if (!validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const res = await fetch("/api/users/email-authentication", {
    method: "POST",
    body: email,
  });

  if (res.status !== 200) {
    alert("E-mail 인증코드 전송 실패");
    return;
  }
};

sendCodeBtn.addEventListener("click", sendEmailCode);
