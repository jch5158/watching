import fetch from "node-fetch";

const githubLogin = (() => {
  const githubLogin = {
    getGithubLoginRedirectUri() {
      const baseUrl = "https://github.com/login/oauth/authorize";
      const config = {
        client_id: process.env.GH_CLIENT_ID,
        scope: "read:user user:email",
      };
      const params = new URLSearchParams(config).toString();
      return `${baseUrl}?${params}`;
    },

    async getGithubAccessToken(code) {
      const baseUrl = "https://github.com/login/oauth/access_token";
      const config = {
        client_id: process.env.GH_CLIENT_ID,
        client_secret: process.env.GH_CLIENT_SECRET,
        code,
      };
      const params = new URLSearchParams(config).toString();
      const finalUri = `${baseUrl}?${params}`;
      const res = await fetch(finalUri, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      if (res.status !== 200) {
        return undefined;
      }
      const { access_token } = await res.json();
      return access_token;
    },
    async getGithubUserData(accessToken) {
      const apiUrl = "https://api.github.com/";
      const res = await fetch(`${apiUrl}user`, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      if (res.status !== 200) {
        return undefined;
      }
      return res.json();
    },

    async getGithubEmailData(accessToken) {
      const apiUrl = "https://api.github.com/";
      const res = await fetch(`${apiUrl}user/emails`, {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      if (res.status !== 200) {
        return undefined;
      }
      const emailData = await res.json();
      const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
      );
      return emailObj;
    },
  };

  return githubLogin;
})();

export default githubLogin;
