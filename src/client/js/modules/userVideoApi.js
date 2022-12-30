const userVideoApi = (() => {
  const userVideoApi = {
    async videoPlay(id) {
      return fetch(`/api/user-videos/${id}`, {
        method: "POST",
      });
    },

    async videoEnded(id) {
      return fetch(`/api/user-videos/${id}`, {
        method: "PUT",
      });
    },

    async videoLike(id) {
      return fetch(`/api/user-videos/${id}/like`, {
        method: "POST",
      });
    },

    async videoUnlike(id) {
      return fetch(`/api/user-videos/${id}/unlike`, {
        method: "POST",
      });
    },

    async submitVideoComment(videoId, text) {
      return fetch("/api/user-video-comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, text }),
      });
    },

    async videoCommentLike(id) {
      return fetch(`/api/user-video-comments/${id}/like`, {
        method: "POST",
      });
    },

    async videoCommentUnlike(id) {
      return fetch(`/api/user-video-comments/${id}/unlike`, {
        method: "POST",
      });
    },

    async videoCommentAddSub(id, text, toUserId) {
      return fetch(`/api/user-video-comments/${id}/sub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ text, toUserId }),
      });
    },

    async addvideoSubComment(id) {},
  };

  return userVideoApi;
})();

export default userVideoApi;
