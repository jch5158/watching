import userApi from "../modules/userApi";
import userVideoApi from "../modules/userVideoApi";

const userVideo = document.querySelector(".watch-user-video__video");
const videoContainer = document.querySelector(".watch-user-video__container");
const userInfo = document.querySelector(".watch-user-video__user-info");
const videoLikeBtn = document.querySelector(".watch-user-video__like-btn");
const subscribeBtn = document.querySelector(".watch-user-video__subscribe-btn");
const userVideoCommentsDiv = document.querySelector(".user-video-comments");
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

const makeComment = (commentInfo, parentElement) => {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("user-video-comment");
  const avatarImg = document.createElement("img");
  avatarImg.classList.add("user-video-comment__comment-avatar");
  avatarImg.src = commentInfo.avatarUrl;
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("user-video-comment__container");
  const nicknameSpan = document.createElement("span");
  nicknameSpan.innerText = `${commentInfo.nickname} • ${new Date(
    commentInfo.createAt
  ).toLocaleDateString("ko-kr", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
  })}`;
  const textSpan = document.createElement("span");
  textSpan.innerText = commentInfo.text;
  const stateBtnsDiv = document.createElement("div");
  stateBtnsDiv.classList.add("user-video-comment__state-btn");
  stateBtnsDiv.dataset.id = commentInfo.id;
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("user-video-comment__like-btn");
  likeBtn.addEventListener("click", likeSubCommentHandler);
  const likeI = document.createElement("i");
  likeI.classList.add("far");
  likeI.classList.add("fa-thumbs-up");
  likeI.classList.add("fa-lg");
  const likeCntSpan = document.createElement("span");
  likeCntSpan.innerText = "0";
  const answerBtn = document.createElement("button");
  answerBtn.innerText = "답글";
  answerBtn.classList.add("user-video-comment__sub-visible-btn");
  answerBtn.addEventListener("click", subCommentInputVisibleHandler);
  const subContainerDiv = document.createElement("div");
  subContainerDiv.classList.add("user-video-comment__sub-container");
  subContainerDiv.classList.add("display-none");
  const tagSpan = document.createElement("span");
  const addSubDiv = document.createElement("div");
  const commentInput = document.createElement("input");
  commentInput.classList.add("user-video-comment__sub-input");
  commentInput.setAttribute("type", "text");
  commentInput.setAttribute("placeholder", "댓글 추가...");
  commentInput.setAttribute("maxLength", "150");
  const commentBtn = document.createElement("button");
  commentBtn.classList.add("user-video-comment__sub-btn");
  commentBtn.innerText = "댓글";
  commentBtn.dataset.id = commentInfo.id;
  commentBtn.addEventListener("click", submitSubCommentHandler);
  const subDiv = document.createElement("div");
  subDiv.classList.add("user-video-comment-sub");
  const addSubBtn = document.createElement("button");
  addSubBtn.classList.add("user-video-comment__add-sub-comment-btn");
  addSubBtn.dataset.id = commentInfo.id;
  addSubBtn.addEventListener("click", addSubCommentHandler);
  const addSubI = document.createElement("i");
  addSubI.classList.add("fas");
  addSubI.classList.add("fa-caret-down");
  addSubI.classList.add("fa-lg");
  const addSubSpan1 = document.createElement("span");
  addSubSpan1.innerText = "답글";
  const addSubSpan2 = document.createElement("span");
  addSubSpan2.innerText = "0";
  const addSubSpan3 = document.createElement("span");
  addSubSpan3.innerText = "개";

  addSubBtn.appendChild(addSubI);
  addSubBtn.appendChild(addSubSpan1);
  addSubBtn.appendChild(addSubSpan2);
  addSubBtn.appendChild(addSubSpan3);
  subDiv.appendChild(addSubBtn);

  addSubDiv.appendChild(commentInput);
  addSubDiv.appendChild(commentBtn);
  subContainerDiv.appendChild(tagSpan);
  subContainerDiv.appendChild(addSubDiv);

  likeBtn.appendChild(likeI);
  likeBtn.appendChild(likeCntSpan);
  stateBtnsDiv.appendChild(likeBtn);
  stateBtnsDiv.appendChild(answerBtn);

  containerDiv.appendChild(nicknameSpan);
  containerDiv.appendChild(textSpan);
  containerDiv.appendChild(stateBtnsDiv);
  containerDiv.appendChild(subContainerDiv);
  containerDiv.appendChild(subDiv);

  commentDiv.appendChild(avatarImg);
  commentDiv.appendChild(containerDiv);

  parentElement.appendChild(commentDiv);
};

const makeSubComments = (likeCounts, subComments, isLikes, parentElement) => {
  const length = subComments.length;

  for (let i = 0; i < length; ++i) {
    const subComDiv = document.createElement("div");
    const avatar = document.createElement("img");
    const subUserDiv = document.createElement("div");
    const subUserInfoDiv = document.createElement("div");
    const infoSpan = document.createElement("span");
    const infoDiv = document.createElement("div");
    const infoDivTextTag = document.createElement("span");
    const infoDivTextSpan = document.createElement("span");
    const subCommentBtnsDiv = document.createElement("div");
    const subBtn1 = document.createElement("button");
    const thumbIcon = document.createElement("i");
    const likeSpan = document.createElement("span");
    const subBtn2 = document.createElement("button");
    const subContainerDiv = document.createElement("div");
    const userTagSpan = document.createElement("span");
    const subDiv = document.createElement("div");
    const subCommentInput = document.createElement("input");
    const subCommentBtn = document.createElement("button");

    subComDiv.classList.add("user-video-sub-comment");
    avatar.classList.add("user-video-sub-comment__avatar");
    subUserDiv.classList.add("user-video-sub-comment__user");
    subUserInfoDiv.classList.add("user-video-sub-comment__user-info");
    subCommentBtnsDiv.classList.add("user-video-sub-comment__btns");
    subBtn1.classList.add("user-video-sub-comment__like-btn");
    subContainerDiv.classList.add("user-video-comment__sub-container");
    subContainerDiv.classList.add("display-none");
    userTagSpan.classList.add("user-video-comment__user-tag");
    subCommentInput.classList.add("user-video-comment__sub-input");
    subCommentBtn.classList.add("user-video-comment__sub-btn");

    subCommentInput.setAttribute("type", "text");
    subCommentInput.setAttribute("placeholder", "댓글 추가...");
    subCommentInput.setAttribute("maxLength", "150");

    if (isLikes[i]) {
      thumbIcon.classList.add("fas");
      subBtn1.addEventListener("click", unlikeSubCommentHandler);
    } else {
      thumbIcon.classList.add("far");
      subBtn1.addEventListener("click", likeSubCommentHandler);
    }
    subBtn2.addEventListener("click", subCommentInputVisibleHandler);

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
    userTagSpan.dataset.id = subComments[i].owner._id;
    userTagSpan.innerText = `@${subComments[i].owner.nickname}`;
    subCommentBtn.innerText = "댓글";
    subCommentBtn.dataset.id = subComments[i].comment;
    subCommentBtn.addEventListener("click", submitSubCommentHandler);

    subBtn1.appendChild(thumbIcon);
    subBtn1.appendChild(likeSpan);

    if (subComments[i].to_user) {
      infoDivTextTag.innerText = `@${subComments[i].to_user.nickname}`;
      infoDivTextTag.classList.add("user-video-sub-comment__tag-text");
    }
    infoDiv.appendChild(infoDivTextTag);
    infoDiv.appendChild(infoDivTextSpan);

    subCommentBtnsDiv.appendChild(subBtn1);
    subCommentBtnsDiv.appendChild(subBtn2);

    subUserInfoDiv.appendChild(infoSpan);
    subUserInfoDiv.appendChild(infoDiv);

    subContainerDiv.appendChild(userTagSpan);
    subContainerDiv.appendChild(subDiv);

    subUserDiv.appendChild(subUserInfoDiv);
    subUserDiv.appendChild(subCommentBtnsDiv);
    subUserDiv.appendChild(subContainerDiv);

    subDiv.appendChild(subCommentInput);
    subDiv.appendChild(subCommentBtn);

    subComDiv.appendChild(avatar);
    subComDiv.appendChild(subUserDiv);

    parentElement.appendChild(subComDiv);
  }
};

const playVideoHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  userVideoApi.videoPlay(id);
};

const endVideoHandler = async () => {
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

const likeVideoHandler = async () => {
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

  videoLikeBtn.removeEventListener("click", likeVideoHandler);
  videoLikeBtn.addEventListener("click", unlikeVideoHandler);
  videoLikeBtn.classList.add("clicked");
};

const unlikeVideoHandler = async () => {
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

  videoLikeBtn.removeEventListener("click", unlikeVideoHandler);
  videoLikeBtn.addEventListener("click", likeVideoHandler);
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

// 코멘트 작성
const submitCommentHandler = async () => {
  const {
    dataset: { id },
  } = videoContainer;

  const text = commentInput.value;
  const res = await userVideoApi.submitVideoComment(id, text);
  if (res.status !== 200) {
    return;
  }
  const result = await res.json();
  result.text = text;
  makeComment(result, userVideoCommentsDiv);
  commentInput.value = "";
};

const likeCommentHandler = async (event) => {
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
  event.target.removeEventListener("click", likeCommentHandler);
  event.target.addEventListener("click", unlikeCommentHandler);
};

const unlikeCommentHandler = async (event) => {
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
  event.target.removeEventListener("click", unlikeCommentHandler);
  event.target.addEventListener("click", likeCommentHandler);
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
      parentElement,
      dataset: { id },
    },
  } = event;

  const res = await userVideoApi.videoCommentAddSub(
    id,
    previousSibling.value,
    parentElement.previousSibling.dataset.id
  );
  if (res.status !== 200) {
    return;
  }
  location.reload();
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

userVideo.addEventListener("play", playVideoHandler);
userVideo.addEventListener("ended", endVideoHandler);
window.addEventListener("keydown", keyEventHandler);

if (videoLikeBtn.classList.contains("clicked")) {
  videoLikeBtn.addEventListener("click", unlikeVideoHandler);
} else {
  videoLikeBtn.addEventListener("click", likeVideoHandler);
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
    commentLikeBtn.addEventListener("click", unlikeCommentHandler);
  } else {
    commentLikeBtn.addEventListener("click", likeCommentHandler);
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
