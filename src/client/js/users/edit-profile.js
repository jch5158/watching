import { validateNickname } from "../validators/userValidator";
import { confirmNickname } from "../modules/users";

const uploadAvatarInput = document.querySelector(".avatar-upload__input");
const uploadAvatar = document.querySelector(".avatar-upload__avatar");
const confirmNicknameBtn = document.querySelector(
  ".login-form__confirm-nickname"
);
const nicknameInput = document.querySelector(".login-form__nickname");
const nicknameResultSpan = document.querySelector(
  ".login-form__nickname-result"
);

let fileUrl;

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

uploadAvatarInput.addEventListener("change", changeAvatarImgHandler);
confirmNicknameBtn.addEventListener("click", confirmNicknameHandler);
