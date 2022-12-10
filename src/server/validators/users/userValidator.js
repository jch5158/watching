export const validateName = (name) => {
  // 한글 2자 이상 15자 이하 허용
  const regExp = /^[가-힣]{2,20}$/;
  return regExp.test(name);
};

export const validateEmail = (email) => {
  if (!email || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
};

export const validateNickname = (nickname) => {
  //- 2자 이상 15자 이하, 영어 또는 숫자 또는 한글로 구성
  //* 특이사항 : 한글 초성 및 모음은 허가하지 않는다.
  const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
  return regExp.test(nickname);
};

export const validatePassword = (password) => {
  //최소 8자 + 최대 15자 + 최소 한개의 소문자 + 최소 한개의 대문자 + 최소 한개의 숫자 + 최소 한개의 특수 문자
  const regExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;

  return regExp.test(password);
};

export const validateImageFile = (file) => {
  if (!file) {
    return false;
  }

  if (
    file.mimetype !== "image/jpg" &&
    file.mimetype !== "image/jpeg" &&
    file.mimetype !== "image/png"
  ) {
    return false;
  }

  return true;
};

export const validateAuthenticode = (authenticode) => {
  if (!authenticode || authenticode.length !== 6) {
    return false;
  }
  return true;
};

export const validateToken = (token) => {
  if (!token || token.length !== 10) {
    return false;
  }

  return true;
};
