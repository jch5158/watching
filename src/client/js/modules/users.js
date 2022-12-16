export const confirmNickname = async (nickname) => {
  const res = await fetch("/api/users/nickname", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname }),
  });

  return res.status;
};

export const setNickname = async (nickname) => {
  const res = await fetch("/api/users/nickname", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname }),
  });

  return res.status;
};
