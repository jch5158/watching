import userValidator from "../validators/userValidator";

const passInput = document.querySelector(".user-form__pass");
const confirmPassInput = document.querySelector(".user-form__confirm-pass");
const passFormatSpan = document.querySelector(".user-form__pass-format");
const passResultSpan = document.querySelector(".user-form__pass-result");

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

passInput.addEventListener("input", checkPassFormatHandler);
confirmPassInput.addEventListener("input", comfirmPassHandler);
