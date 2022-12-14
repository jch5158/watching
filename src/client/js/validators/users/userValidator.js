export const validateEmail = (email) => {
  if (!email || email.length > 320) {
    return false;
  }

  const regExp =
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

  return regExp.test(email);
};

export const validateNickname = (nickname) => {
  const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
  if (!regExp.test(nickname)) {
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
