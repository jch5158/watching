const flashMessage = {
  success: "success",
  warning: "warning",
  error: "error",

  loginFailed(req) {
    req.flash(warning, "로그인 실패");
  },
  inputWarning(req) {
    req.flash(warning, "입력값의 문제가 있습니다.");
  },
};

export default flashMessage;
