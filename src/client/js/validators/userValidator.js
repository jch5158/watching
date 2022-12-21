const userValidator = (() => {
  const userValidator = {
    validateEmail(email) {
      if (!email || email.length > 320) {
        return false;
      }

      const regExp =
        /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;

      return regExp.test(email);
    },

    validateNickname(nickname) {
      const regExp = /^(?=.*[a-z0-9가-힣])[a-z0-9가-힣]{2,15}$/;
      return regExp.test(nickname);
    },

    validateAuthenticode(authenticode) {
      if (!authenticode || authenticode.length !== 6) {
        return false;
      }
      return true;
    },

    validatePassword(pass) {
      const regExp =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
      return regExp.test(pass);
    },
  };

  return userValidator;
})();

export default userValidator;
