const userVideo = document.querySelector(".watch-user-video__video");
const videoContainer = document.querySelector(".watch-user-video__container");

const videoLikeBtn = document.querySelector(".watch-user-video__like-btn");

const numberOfLikesSpan = document.querySelector(
  ".watch-user-video__like-btn span:first-child"
);

const videoPlayHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  fetch(`/api/user-videos/${id}`, {
    method: "POST",
  });
};

const videoEndedHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  fetch(`/api/user-videos/${id}`, {
    method: "PUT",
  });
};

const keyEventHandler = (() => {
  let isFullScreen = false;

  return (event) => {
    const { key } = event;
    if (document.activeElement.tagName === "VIDEO") {
      if (key === " ") {
        video.paused ? video.play() : video.pause();
      } else if (key === "ㄹ" || key === "F" || key === "f") {
        if (isFullScreen) {
          document.exitFullscreen();
        } else {
          userVideo.requestFullscreen();
        }
        isFullScreen = !isFullScreen;
      }
    }
  };
})();

const videoLikeHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  const res = await fetch(`/api/user-videos/${id}/like`, {
    method: "POST",
  });

  if (res.status !== 200) {
    return;
  }

  numberOfLikesSpan.innerText = (
    Number(String(numberOfLikesSpan.innerText).replace(",", "")) + 1
  ).toLocaleString("ko-KR");

  videoLikeBtn.removeEventListener("click", videoLikeHandler);
  videoLikeBtn.addEventListener("click", videoUnLikeHandler);
  videoLikeBtn.classList.add("unlike");
};

const videoUnLikeHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  const res = await fetch(`/api/user-videos/${id}/unlike`, {
    method: "POST",
  });

  if (res.status !== 200) {
    return;
  }

  numberOfLikesSpan.innerText = (
    Number(String(numberOfLikesSpan.innerText).replace(",", "")) - 1
  ).toLocaleString("ko-KR");

  videoLikeBtn.removeEventListener("click", videoUnLikeHandler);
  videoLikeBtn.addEventListener("click", videoLikeHandler);
  videoLikeBtn.classList.remove("unlike");
};

userVideo.addEventListener("play", videoPlayHandler);
userVideo.addEventListener("ended", videoEndedHandler);
window.addEventListener("keydown", keyEventHandler);

if (videoLikeBtn.classList.contains("unlike")) {
  videoLikeBtn.addEventListener("click", videoUnLikeHandler);
} else {
  videoLikeBtn.addEventListener("click", videoLikeHandler);
}
