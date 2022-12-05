import User from "../models/User";

function validateName(name) {
  // 한글 2자 이상 15자 이하 허용
  const regExp = /^[가-힣]{2,20}$/;
  return regExp.test(name);
}

function validateEmail(email) {
  if (email.length < 5 || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
}

function validateNickName(nickname) {
  //- 2자 이상 15자 이하, 영어 또는 숫자 또는 한글로 구성
  //* 특이사항 : 한글 초성 및 모음은 허가하지 않는다.
  const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
  return regExp.test(nickname);
}

function validatePassword(password, passwordConfirm) {
  if (password !== passwordConfirm) {
    return false;
  }

  //최소 8자 + 최대 15자 + 최소 한개의 소문자 + 최소 한개의 대문자 + 최소 한개의 숫자 + 최소 한개의 특수 문자
  const regExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

  return regExp.test(password);
}

function validateFile(file) {
  if (
    file.mimetype !== "image/jpg" ||
    file.mimetype !== "image/jpeg" ||
    file.mimetype !== "image/png"
  ) {
    return false;
  }

  return true;
}

export const getJoin = (req, res) => {
  res.render("screens/users/join", { pageTitle: "회원가입" });
};

export const postJoin = async (req, res) => {
  const joinTemplate = "screens/users/join";

  const {
    body: { name, email, nickname, password, password_confirm },
    file,
  } = req;

  if (
    !validateName(name) ||
    !validateEmail(email) ||
    !validateNickName(nickname) ||
    !validatePassword(password, password_confirm) ||
    !file
  ) {
    return res.status(400).render(joinTemplate);
  }

  try {
    const emailExists = await User.exists({ email });
    if (emailExists) {
      // 이메일이 중복됩니다.
      return res.status(400).render(joinTemplate);
    }

    const nicknameExists = await User.exists({ nickname });
    if (nicknameExists) {
      // 닉네임이 중복됩니다.
      return res.status(400).render(joinTemplate);
    }

    await User.create({
      name,
      email,
      nickname,
      password,
      avatar_url: file.path,
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }

  return res.redirect("/");
};
