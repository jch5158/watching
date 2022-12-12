const emailInput = document.querySelector(".login-form__email");
const sendAuthenticodeBtn = document.querySelector(
  ".login-form__send-authenticode"
);
const authenticodeInput = document.querySelector(".login-form__authenticode");
const authenticodeTTLspan = document.querySelector(
  ".login-form__authenticode-ttl"
);
const uploadAvatarInput = document.querySelector(".avatar-upload__input");
const uploadAvatar = document.querySelector(".avatar-upload__avatar");

const nicknameInput = document.querySelector(".login-form__nickname");
const nicknameConfirmBtn = document.querySelector(
  ".login-form__confirm-nickname"
);

const nicknameResultSpan = document.querySelector(
  ".login-form__nickname-result"
);

let time = 180;
let authenticodeTTLInterval;
let fileUrl;

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

const printAuthenticodeTTL = () => {
  if (authenticodeTTLInterval) {
    time = 180;
    clearInterval(authenticodeTTLInterval);
  }

  authenticodeTTLInterval = setInterval(() => {
    time--;
    const fomrSec = parseInt(time % 60);
    const min = parseInt(time / 60);
    const sec = fomrSec >= 10 ? fomrSec : `0${fomrSec}`;

    if (time < 0) {
      clearInterval(authenticodeTTLInterval);
      authenticodeTTLspan.innerText = "시간 초과";
      console.log("Asdf");
      time = 180;
      authenticodeTTLInterval = 0;
    } else {
      authenticodeTTLspan.innerText = `0${min}:${sec}`;
    }
  }, 1000);
};

const sendAuthenticode = async () => {
  const email = emailInput.value;
  if (!validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const res = await fetch("/api/users/authenticode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (res.status !== 200) {
    const { message } = await res.json();
    if (message) {
      alert(message);
    } else {
      alert("E-mail 인증코드 전송 실패");
    }
    return;
  }

  sendAuthenticodeBtn.innerText = "인증번호 재발송";
  authenticodeTTLspan.innerText = "03:00";
  printAuthenticodeTTL();
};

const confirmAuthenticode = async () => {
  const email = emailInput.value;
  if (!validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const authenticode = authenticodeInput.value;
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

  sendAuthenticodeBtn.disabled = true;
  confirmAuthenticodeBtn.disabled = true;
  confirmAuthenticodeBtn.innerText = "인증 완료";
  clearInterval(authenticodeTTLInterval);
  authenticodeTTLspan.innerText = "";
  const { token } = await res.json();
  tokenInput.value = token;
  return;
};

const changeAvatarImg = (event) => {
  if (fileUrl) {
    URL.revokeObjectURL(fileUrl);
  }
  const file = event.target.files[0];
  fileUrl = URL.createObjectURL(file);
  uploadAvatar.src = fileUrl;
};

const confirmNickname = async () => {
  const nickname = nicknameInput.value;
  const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
  if (!regExp.test(nickname)) {
    alert("닉네임 형식이 잘못되었습니다.");
    return;
  }
  const res = await fetch("/api/users/confirm-nickname", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname }),
  });

  if (res.status !== 200) {
    nicknameResultSpan.innerText = "중복된 닉네임입니다.";
    return;
  }

  nicknameResultSpan.innerText = "사용 가능한 닉네임입니다.";
};

sendAuthenticodeBtn.addEventListener("click", sendAuthenticode);
confirmAuthenticodeBtn.addEventListener("click", confirmAuthenticode);
uploadAvatarInput.addEventListener("change", changeAvatarImg);
nicknameConfirmBtn.addEventListener("click", confirmNickname);
