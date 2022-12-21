const userApi = (() => {
  const userApi = {
    async confirmNickname(nickname) {
      const res = await fetch("/api/users/nickname", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      return res.status;
    },

    async setNickname(nickname) {
      const res = await fetch("/api/users/nickname", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      return res.status;
    },

    async requestAuthenticode(email) {
      const baseUrl = "/api/users/email/authenticode";
      const config = {
        email,
      };
      const params = new URLSearchParams(config).toString();
      const finalUri = `${baseUrl}?${params}`;
      const res = await fetch(finalUri, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return res.status;
    },

    async confirmAuthenticode(email, authenticode) {
      return await fetch("/api/users/email/authenticode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, authenticode }),
      });
    },
  };

  return userApi;
})();

export default userApi;
