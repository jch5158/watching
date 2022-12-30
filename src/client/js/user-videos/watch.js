import userApi from "../modules/userApi";
import userVideoApi from "../modules/userVideoApi";

const userVideo = document.querySelector(".watch-user-video__video");
const videoContainer = document.querySelector(".watch-user-video__container");
const userInfo = document.querySelector(".watch-user-video__user-info");
const videoLikeBtn = document.querySelector(".watch-user-video__like-btn");
const subscribeBtn = document.querySelector(".watch-user-video__subscribe-btn");
const subScribeCntSpan = document.querySelector(
  ".watch-user-video__subscribe_cnt"
);
const commentInput = document.querySelector(".user-video-comments__input");
const commentBtn = document.querySelector(".user-video-comments__input-btn");
const commentLikeBtns = document.querySelectorAll(
  ".user-video-comment__like-btn"
);
const numberOfLikesSpan = document.querySelector(
  ".watch-user-video__like-btn span:first-child"
);
const subCommentInputVisibleBtns = document.querySelectorAll(
  ".user-video-comment__sub-visible-btn"
);
const subCommentBtns = document.querySelectorAll(
  ".user-video-comment__sub-btn"
);
const addSubCommentBtns = document.querySelectorAll(
  ".user-video-comment__add-sub-comment-btn"
);

const makeSubComments = (likeCounts, subComments, isLikes, parentElement) => {
  const length = subComments.length;

  for (let i = 0; i < length; ++i) {
    const subComDiv = document.createElement("div");
    const avatar = document.createElement("img");
    const subUserDiv = document.createElement("div");
    const subUserInfoDiv = document.createElement("div");
    const infoSpan = document.createElement("span");
    const infoDiv = document.createElement("div");
    const infoDivTextSpan = document.createElement("span");
    const subCommentBtnsDiv = document.createElement("div");
    const subBtn1 = document.createElement("button");
    const thumbIcon = document.createElement("i");
    const likeSpan = document.createElement("span");
    const subBtn2 = document.createElement("button");

    subComDiv.classList.add("user-video-sub-comment");
    avatar.classList.add("user-video-sub-comment__avatar");
    subUserDiv.classList.add("user-video-sub-comment__user");
    subUserInfoDiv.classList.add("user-video-sub-comment__user-info");
    subCommentBtnsDiv.classList.add("user-video-sub-comment__btns");
    subBtn1.classList.add("user-video-sub-comment__like-btn");

    if (isLikes[i]) {
      thumbIcon.classList.add("fas");
      subBtn1.addEventListener("click", unlikeSubCommentHandler);
    } else {
      thumbIcon.classList.add("far");
      subBtn1.addEventListener("click", likeSubCommentHandler);
    }

    thumbIcon.classList.add("fa-thumbs-up");
    thumbIcon.classList.add("fa-lg");

    avatar.src = subComments[i].owner.avatar_url;
    infoSpan.innerText = `${subComments[i].owner.nickname} • ${new Date(
      subComments[i].create_at
    ).toLocaleDateString("ko-kr", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
    })}`;
    infoDivTextSpan.innerText = subComments[i].text;
    likeSpan.innerText = likeCounts[i];
    subBtn2.innerText = "답글";
    subBtn1.dataset.id = subComments[i]._id;

    subBtn1.appendChild(thumbIcon);
    subBtn1.appendChild(likeSpan);

    infoDiv.appendChild(infoDivTextSpan);

    subCommentBtnsDiv.appendChild(subBtn1);
    subCommentBtnsDiv.appendChild(subBtn2);

    subUserInfoDiv.appendChild(infoSpan);
    subUserInfoDiv.appendChild(infoDiv);

    subUserDiv.appendChild(subUserInfoDiv);
    subUserDiv.appendChild(subCommentBtnsDiv);

    subComDiv.appendChild(avatar);
    subComDiv.appendChild(subUserDiv);

    parentElement.appendChild(subComDiv);
  }
};

const videoPlayHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  userVideoApi.videoPlay(id);
};

const videoEndedHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  userVideoApi.videoEnded(id);
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

  const res = await userVideoApi.videoLike(id);
  if (res.status !== 200) {
    return;
  }

  numberOfLikesSpan.innerText = (
    Number(String(numberOfLikesSpan.innerText).replace(",", "")) + 1
  ).toLocaleString("ko-KR");

  videoLikeBtn.removeEventListener("click", videoLikeHandler);
  videoLikeBtn.addEventListener("click", videoUnLikeHandler);
  videoLikeBtn.classList.add("clicked");
};

const videoUnLikeHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  const res = await userVideoApi.videoUnlike(id);
  if (res.status !== 200) {
    return;
  }

  numberOfLikesSpan.innerText = (
    Number(String(numberOfLikesSpan.innerText).replace(",", "")) - 1
  ).toLocaleString("ko-KR");

  videoLikeBtn.removeEventListener("click", videoUnLikeHandler);
  videoLikeBtn.addEventListener("click", videoLikeHandler);
  videoLikeBtn.classList.remove("clicked");
};

const subscribeHandler = async () => {
  const {
    dataset: { id },
  } = userInfo;

  const res = await userApi.subscribe(id);
  if (res.status !== 200) {
    return;
  }

  subscribeBtn.removeEventListener("click", subscribeHandler);
  subscribeBtn.addEventListener("click", unsubscribeHandler);
  subscribeBtn.classList.add("clicked");
  subscribeBtn.innerText = "구독중";
  subScribeCntSpan.innerText = Number(subScribeCntSpan.innerText) + 1;
};

const unsubscribeHandler = async () => {
  const {
    dataset: { id },
  } = userInfo;

  const res = await userApi.unsubscribe(id);
  if (res.status !== 200) {
    return;
  }

  subscribeBtn.removeEventListener("click", unsubscribeHandler);
  subscribeBtn.addEventListener("click", subscribeHandler);
  subscribeBtn.classList.remove("clicked");
  subscribeBtn.innerText = "구독";
  subScribeCntSpan.innerText = Number(subScribeCntSpan.innerText) - 1;
};

const submitCommentHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;
  const text = commentInput.value;
  const res = await userVideoApi.submitVideoComment(id, text);
  if (res.status !== 200) {
    return;
  }

  commentInput.value = "";
};

const commentLikeHandler = async (event) => {
  const {
    dataset: { id },
  } = event.target.parentElement;

  const res = await userVideoApi.videoCommentLike(id);
  if (res.status !== 200) {
    return;
  }

  event.target.children[0].classList.remove("far");
  event.target.children[0].classList.add("fas");
  event.target.children[1].innerText =
    Number(event.target.children[1].innerText) + 1;
  event.target.classList.add("liked");
  event.target.removeEventListener("click", commentLikeHandler);
  event.target.addEventListener("click", commentUnLikeHandler);
};

const commentUnLikeHandler = async (event) => {
  const {
    dataset: { id },
  } = event.target.parentElement;
  const res = await userVideoApi.videoCommentUnlike(id);
  if (res.status !== 200) {
    return;
  }
  event.target.children[0].classList.remove("fas");
  event.target.children[0].classList.add("far");
  event.target.children[1].innerText =
    Number(event.target.children[1].innerText) - 1;
  event.target.classList.remove("liked");
  event.target.removeEventListener("click", commentUnLikeHandler);
  event.target.addEventListener("click", commentLikeHandler);
};

const subCommentInputVisibleHandler = (event) => {
  const {
    target: {
      parentElement: { nextSibling },
    },
    target,
  } = event;

  target.innerText = "취소";
  nextSibling.classList.remove("display-none");
  target.removeEventListener("click", subCommentInputVisibleHandler);
  target.addEventListener("click", subCommentInputInisibleHandler);
};

const subCommentInputInisibleHandler = (event) => {
  const {
    target: {
      parentElement: { nextSibling },
    },
    target,
  } = event;

  target.innerText = "답글";
  nextSibling.classList.add("display-none");
  target.removeEventListener("click", subCommentInputInisibleHandler);
  target.addEventListener("click", subCommentInputVisibleHandler);
};

const submitSubCommentHandler = async (event) => {
  const {
    target: {
      previousSibling,
      dataset: { id },
    },
  } = event;

  const res = await userVideoApi.videoCommentLikeAddSub(
    id,
    previousSibling.value
  );
  if (res.status !== 200) {
    return;
  }
  previousSibling.value = "";
};

const addSubCommentHandler = async (event) => {
  const {
    target: {
      dataset: { id },
      parentElement: { parentElement },
      children,
    },
    target,
  } = event;

  const res = await fetch(`/api/user-video-comments/${id}/sub`);
  if (res.status !== 200) {
    return;
  }

  const containerDiv = document.createElement("div");
  children[0].classList.remove("fa-caret-down");
  children[0].classList.add("fa-caret-up");
  const { subComments, likeCounts, isLikes } = await res.json();
  makeSubComments(likeCounts, subComments, isLikes, containerDiv);
  parentElement.appendChild(containerDiv);
  target.removeEventListener("click", addSubCommentHandler);
  target.addEventListener("click", removeSubCommentHandler);
};

const removeSubCommentHandler = async (event) => {
  const {
    target: {
      dataset: { id },
      parentElement: { parentElement },
      children,
    },
    target,
  } = event;
  children[0].classList.remove("fa-caret-up");
  children[0].classList.add("fa-caret-down");
  parentElement.removeChild(parentElement.lastChild);
  target.removeEventListener("click", removeSubCommentHandler);
  target.addEventListener("click", addSubCommentHandler);
};

const likeSubCommentHandler = async (event) => {
  const {
    target,
    target: { children },
    target: {
      dataset: { id },
    },
  } = event;

  const res = await fetch(`/api/user-video-sub-comments/${id}/like`, {
    method: "POST",
  });

  if (res.status !== 200) {
    return;
  }

  children[0].classList.remove("far");
  children[0].classList.add("fas");
  children[1].innerText = Number(children[1].innerText) + 1;

  target.removeEventListener("click", likeSubCommentHandler);
  target.addEventListener("click", unlikeSubCommentHandler);
};

const unlikeSubCommentHandler = async (event) => {
  const {
    target,
    target: { children },
    target: {
      dataset: { id },
    },
  } = event;

  const res = await fetch(`/api/user-video-sub-comments/${id}/like`, {
    method: "DELETE",
  });

  if (res.status !== 200) {
    return;
  }

  children[0].classList.remove("fas");
  children[0].classList.add("far");
  children[1].innerText = Number(children[1].innerText) - 1;

  target.removeEventListener("click", unlikeSubCommentHandler);
  target.addEventListener("click", likeSubCommentHandler);
};

userVideo.addEventListener("play", videoPlayHandler);
userVideo.addEventListener("ended", videoEndedHandler);
window.addEventListener("keydown", keyEventHandler);

if (videoLikeBtn.classList.contains("clicked")) {
  videoLikeBtn.addEventListener("click", videoUnLikeHandler);
} else {
  videoLikeBtn.addEventListener("click", videoLikeHandler);
}

if (subscribeBtn) {
  if (subscribeBtn.classList.contains("clicked")) {
    subscribeBtn.addEventListener("click", unsubscribeHandler);
  } else {
    subscribeBtn.addEventListener("click", subscribeHandler);
  }
}

commentBtn.addEventListener("click", submitCommentHandler);

for (let commentLikeBtn of commentLikeBtns) {
  if (commentLikeBtn.classList.contains("liked")) {
    commentLikeBtn.addEventListener("click", commentUnLikeHandler);
  } else {
    commentLikeBtn.addEventListener("click", commentLikeHandler);
  }
}

for (let subCommentInputVisibleBtn of subCommentInputVisibleBtns) {
  subCommentInputVisibleBtn.addEventListener(
    "click",
    subCommentInputVisibleHandler
  );
}

for (let subCommentBtn of subCommentBtns) {
  subCommentBtn.addEventListener("click", submitSubCommentHandler);
}

for (let addSubCommentBtn of addSubCommentBtns) {
  addSubCommentBtn.addEventListener("click", addSubCommentHandler);
}
