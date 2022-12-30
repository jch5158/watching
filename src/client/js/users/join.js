import userValidator from "../validators/userValidator";
import userApi from "../modules/userApi";

const emailInput = document.querySelector(".user-form__email");
const reqAuthenticodeBtn = document.querySelector(
  ".user-form__req-authenticode"
);
const authenticodeInput = document.querySelector(".user-form__authenticode");
const authenticodeTTLSpan = document.querySelector(
  ".user-form__authenticode-ttl"
);
const uploadAvatarInput = document.querySelector(".avatar-upload__input");
const uploadAvatar = document.querySelector(".avatar-upload__avatar");

const nicknameInput = document.querySelector(".user-form__nickname");
const nicknameConfirmBtn = document.querySelector(
  ".user-form__confirm-nickname"
);

const nicknameResultSpan = document.querySelector(
  ".user-form__nickname-result"
);

const confirmAuthenticodeBtn = document.querySelector(
  ".user-form__confirm-authenticode"
);
const tokenInput = document.querySelector(".user-form__token");

const passInput = document.querySelector(".user-form__pass");
const confirmPassInput = document.querySelector(".user-form__confirm-pass");
const passFormatSpan = document.querySelector(".user-form__pass-format");
const passResultSpan = document.querySelector(".user-form__pass-result");

let authenticodeTTLInterval;
let fileUrl;

const printAuthenticodeTTL = () => {
  let time = 180;
  if (authenticodeTTLInterval) {
    clearInterval(authenticodeTTLInterval);
  }

  authenticodeTTLInterval = setInterval(() => {
    time--;
    const fomrSec = parseInt(time % 60);
    const min = parseInt(time / 60);
    const sec = fomrSec >= 10 ? fomrSec : `0${fomrSec}`;

    if (time < 0) {
      clearInterval(authenticodeTTLInterval);
      authenticodeTTLSpan.innerText = "시간 초과";
      console.log("Asdf");
      time = 180;
      authenticodeTTLInterval = 0;
    } else {
      authenticodeTTLSpan.innerText = `0${min}:${sec}`;
    }
  }, 1000);
};

const reqAuthenticodeHandler = async () => {
  const email = emailInput.value;
  if (!userValidator.validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const status = await userApi.requestAuthenticode(email);
  if (status !== 200) {
    alert("E-mail 인증코드 전송 실패");
    return;
  }

  alert("인증코드가 전송되었습니다.");
  reqAuthenticodeBtn.innerText = "인증번호 재발송";
  authenticodeTTLSpan.innerText = "03:00";
  printAuthenticodeTTL();
};

const convertUppercaseHandler = async () => {
  const authenticode = authenticodeInput.value;
  authenticodeInput.value = authenticode.toUpperCase();
};

const confirmAuthenticodeHandler = async () => {
  const email = emailInput.value;
  if (!userValidator.validateEmail(email)) {
    alert("E-mail 형식이 잘못됐습니다.");
    return;
  }

  const authenticode = authenticodeInput.value;
  if (!userValidator.validateAuthenticode(authenticode)) {
    alert("E-mail code가 잘못됐습니다.");
    return;
  }

  const res = await userApi.confirmAuthenticode(email, authenticode);
  if (res.status !== 200) {
    alert("E-mail 인증 실패");
    return;
  }

  reqAuthenticodeBtn.disabled = true;
  confirmAuthenticodeBtn.disabled = true;

  emailInput.classList.add("disabled");
  authenticodeInput.classList.add("disabled");

  confirmAuthenticodeBtn.innerText = "인증 완료";
  clearInterval(authenticodeTTLInterval);
  authenticodeTTLSpan.innerText = "";
  const { token } = await res.json();
  tokenInput.value = token;
  return;
};

const changeAvatarImgHandler = (event) => {
  if (fileUrl) {
    URL.revokeObjectURL(fileUrl);
  }
  const file = event.target.files[0];
  fileUrl = URL.createObjectURL(file);
  uploadAvatar.src = fileUrl;
};

const confirmNicknameHandler = async () => {
  const nickname = nicknameInput.value;
  if (!userValidator.validateNickname(nickname)) {
    alert("닉네임 형식이 잘못되었습니다.");
    return;
  }

  const status = await userApi.confirmNickname(nickname);
  if (status !== 200) {
    nicknameResultSpan.innerText = "중복된 닉네임입니다.";
    return;
  }

  nicknameResultSpan.innerText = "사용 가능한 닉네임입니다.";
};

const checkPassFormatHandler = () => {
  const pass = passInput.value;
  if (userValidator.validatePassword(pass)) {
    passFormatSpan.innerText = "사용 가능한 비밀번호입니다.";
  } else {
    passFormatSpan.innerText = "비밀번호 형식이 잘못되었습니다.";
  }
};

const comfirmPassHandler = () => {
  const pass = passInput.value;
  const confirmPass = confirmPassInput.value;
  if (!userValidator.validatePassword(pass)) {
    passResultSpan.innerText = "비밀번호 형식을 확인해주세요.";
  }

  if (pass === confirmPass) {
    passResultSpan.innerText = "패스워드가 일치합니다.";
  } else {
    passResultSpan.innerText = "패스워드가 일치하지 않습니다.";
  }
};

reqAuthenticodeBtn.addEventListener("click", reqAuthenticodeHandler);
confirmAuthenticodeBtn.addEventListener("click", confirmAuthenticodeHandler);
authenticodeInput.addEventListener("input", convertUppercaseHandler);
uploadAvatarInput.addEventListener("change", changeAvatarImgHandler);
nicknameConfirmBtn.addEventListener("click", confirmNicknameHandler);
passInput.addEventListener("input", checkPassFormatHandler);
confirmPassInput.addEventListener("input", comfirmPassHandler);
