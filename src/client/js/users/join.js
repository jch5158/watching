const emailInfo = document.querySelector(".login-form__email");
const sendCodeBtn = document.querySelector(".login-form__send-code");
const authenticodeInfo = document.querySelector(".login-form__authenticode");
const confirmAuthenticodeBtn = document.querySelector(
  ".login-form__confirm-authenticode"
);
const tokenInput = document.querySelector(".login-form__token");

const validateEmail = (email) => {
  if (!email || email.length < 5 || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
};

const validateAuthenticode = (authenticode) => {
  if (!authenticode || authenticode.length !== 6) {
    return false;
  }

  return true;
};

const sendAuthenticode = async () => {
  const email = emailInfo.value;
  if (!validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const res = await fetch("/api/users/authenticate", {
    method: "POST",
    body: email,
  });

  if (res.status !== 200) {
    alert("E-mail 인증코드 전송 실패");
    return;
  }
};

const confirmAuthenticode = async () => {
  const email = emailInfo.value;
  if (!validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const authenticode = authenticodeInfo.value;
  if (!validateAuthenticode(authenticode)) {
    alert("E-mail code가 잘못됐습니다.");
    return;
  }

  const res = await fetch("/api/users/confirm-authenticode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, authenticode }),
  });

  if (res.status !== 200) {
    alert("E-mail 인증 실패");
    return;
  }

  const { token } = await res.json();
  tokenInput.value = token;
  return;
};

sendCodeBtn.addEventListener("click", sendAuthenticode);
confirmAuthenticodeBtn.addEventListener("click", confirmAuthenticode);
