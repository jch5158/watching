import fetch from "node-fetch";

const kakaoLogin = (() => {
  const kakaoLogin = {
    getKakaoLoginRedirectUri() {
      const baseUrl = "https://kauth.kakao.com/oauth/authorize";
      const config = {
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URL,
        response_type: "code",
      };
      const params = new URLSearchParams(config).toString();
      return `${baseUrl}?${params}`;
    },

    async getKakaoAccessToken(code) {
      const baseUrl = "https://kauth.kakao.com/oauth/token";
      const config = {
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID,
        redirect_uri: process.env.KAKAO_REDIRECT_URL,
        code,
      };
      const params = new URLSearchParams(config).toString();
      const finalUri = `${baseUrl}?${params}`;
      const res = await fetch(finalUri, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        },
      });
      if (res.status !== 200) {
        return undefined;
      }
      const { access_token } = await res.json();
      return access_token;
    },

    async getKakaoUserData(accessToken) {
      const apiUrl = "https://kapi.kakao.com/v2/user/me";
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.status !== 200) {
        return undefined;
      }
      return res.json();
    },
  };
  return kakaoLogin;
})();

export default kakaoLogin;
