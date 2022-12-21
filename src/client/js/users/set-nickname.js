import userValidator from "../validators/userValidator";
import userApi from "../modules/usersApi";

const nicknameInput = document.querySelector(".user-form__nickname");
const nicknameConfirmBtn = document.querySelector(
  ".user-form__confirm-nickname"
);
const nicknameResultSpan = document.querySelector(
  ".user-form__nickname-result"
);
const setNicknameSubmit = document.querySelector(
  '.set-nickname-container input[type="submit"]'
);

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

const setNicknameHandler = async (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value;
  if (!validateNickname(nickname)) {
    alert("닉네임 형식이 잘못되었습니다.");
    return;
  }

  const status = await userApi.setNickname(nickname);
  if (status !== 200) {
    alert("닉네임 설정이 불가합니다.");
    return;
  }
  alert("닉네임 설정 완료");
  location.replace("/");
};

nicknameConfirmBtn.addEventListener("click", confirmNicknameHandler);
setNicknameSubmit.addEventListener("click", setNicknameHandler);
