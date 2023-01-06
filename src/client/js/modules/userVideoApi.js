const userVideoApi = (() => {
  const userVideoApi = {
    async getVideos(count, keyword) {
      const config = { count, keyword };
      const params = new URLSearchParams(config).toString();
      return fetch(`/api/home/user-videos?${params}`);
    },

    async getScrollProfileVideos(count, channelId) {
      const config = { count, channelId };
      const params = new URLSearchParams(config).toString();
      return fetch(`/api/profile/user-videos?${params}`);
    },

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

    async updateVideoComment(commendId, text) {
      return fetch(`/api/user-video-comments/${commendId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
    },

    async getSideVideo(userId, videoId, count) {
      const config = {
        userId,
        videoId,
        count,
      };
      const params = new URLSearchParams(config).toString();
      return fetch(`/api/side-user-videos/?${params}`, {
        method: "GET",
      });
    },

    async deleteVideoComment(id) {
      return fetch(`/api/user-video-comments/${id}`, {
        method: "DELETE",
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

    async updateSubComment(subCommentId, text) {
      return fetch(`/api/user-video-sub-comments/${subCommentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
    },

    async deleteSubComment(id) {
      return fetch(`/api/user-video-sub-comments/${id}`, {
        method: "DELETE",
      });
    },
  };

  return userVideoApi;
})();

export default userVideoApi;
