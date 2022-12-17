import { validateNickname } from "../validators/userValidator";
import { confirmNickname, setNickname } from "../modules/users";

const nicknameInput = document.querySelector(".login-form__nickname");
const nicknameConfirmBtn = document.querySelector(
  ".login-form__confirm-nickname"
);
const nicknameResultSpan = document.querySelector(
  ".login-form__nickname-result"
);
const setNicknameSubmit = document.querySelector(
  '.set-nickname-container input[type="submit"]'
);

const confirmNicknameHandler = async () => {
  const nickname = nicknameInput.value;
  if (!validateNickname(nickname)) {
    alert("닉네임 형식이 잘못되었습니다.");
    return;
  }

  const status = await confirmNickname(nickname);
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

  const status = await setNickname(nickname);
  if (status !== 200) {
    alert("닉네임 설정이 불가합니다.");
    return;
  }
  alert("닉네임 설정 완료");
  location.replace("/");
};

nicknameConfirmBtn.addEventListener("click", confirmNicknameHandler);
setNicknameSubmit.addEventListener("click", setNicknameHandler);
