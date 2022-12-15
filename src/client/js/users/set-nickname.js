import { validateNickname } from "../validators/users/userValidator";

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

console.log(setNicknameSubmit);

const confirmNickname = async () => {
  const nickname = nicknameInput.value;
  if (!validateNickname(nickname)) {
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

const setNickname = async (event) => {
  event.preventDefault();
  const nickname = nicknameInput.value;
  if (!validateNickname(nickname)) {
    alert("닉네임 형식이 잘못되었습니다.");
    return;
  }
  const res = await fetch("/users/nickname/set", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname }),
  });

  if (res.status !== 200) {
    alert("닉네임 설정이 불가합니다.");
    return;
  }

  alert("닉네임 설정 완료");
  location.replace("/");
};

nicknameConfirmBtn.addEventListener("click", confirmNickname);
setNicknameSubmit.addEventListener("click", setNickname);
