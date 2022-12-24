import userValidator from "../validators/userValidator";
import userApi from "../modules/usersApi";

const uploadAvatarInput = document.querySelector(".avatar-upload__input");
const uploadAvatar = document.querySelector(".avatar-upload__avatar");
const confirmNicknameBtn = document.querySelector(
  ".user-form__confirm-nickname"
);
const nicknameInput = document.querySelector(".user-form__nickname");
const nicknameResultSpan = document.querySelector(
  ".user-form__nickname-result"
);

const changeAvatarImgHandler = () => {
  let fileUrl;
  return (event) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    const file = event.target.files[0];
    fileUrl = URL.createObjectURL(file);
    uploadAvatar.src = fileUrl;
  };
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

uploadAvatarInput.addEventListener("change", changeAvatarImgHandler);
confirmNicknameBtn.addEventListener("click", confirmNicknameHandler);
