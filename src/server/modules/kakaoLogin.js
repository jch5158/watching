import fetch from "node-fetch";

export const getKakaoLoginRedirectUri = () => {
  const baseUrl = "https://kauth.kakao.com/oauth/authorize";
  const config = {
    client_id: process.env.KAKAO_CLIENT_ID,
    redirect_uri: process.env.KAKAO_REDIRECT_URL,
    response_type: "code",
  };
  const params = new URLSearchParams(config).toString();
  return `${baseUrl}?${params}`;
};

export const getKakaoAccessToken = async (code) => {
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
};

export const getKakaoUserData = async (accessToken) => {
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
  return await res.json();
};

export const unlinkKaKaoAccount = async (accessToken) => {
  const apiUrl = "https://kapi.kakao.com/v1/user/unlink";
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (res.status !== 200) {
    return false;
  }
  const { id } = await res.json();
  return id;
};
