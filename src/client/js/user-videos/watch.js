import userApi from "../modules/userApi";
import userVideoApi from "../modules/userVideoApi";

const userIdDiv = document.querySelector(".watch-user-video");
const userVideo = document.querySelector(".watch-user-video__video");
const videoContainer = document.querySelector(".watch-user-video__container");
const userInfo = document.querySelector(".watch-user-video__user-info");
const videoLikeBtn = document.querySelector(".watch-user-video__like-btn");
const subscribeBtn = document.querySelector(".watch-user-video__subscribe-btn");
const uservideoCommentMixDiv = document.querySelector(
  ".user-video-comments__mixin"
);

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
const commentUpdateBtns = document.querySelectorAll(
  ".user-video-comment__update-btn"
);
const commentDeleteBtns = document.querySelectorAll(
  ".user-video-comment__delete-btn"
);
const commentUpdateSaveBtns = document.querySelectorAll(
  ".user-video-comment__update-save-btn"
);
const numberOfComment = document.querySelector(
  ".user-video-comments__number-of-comments"
);
const sideVideoContainer = document.querySelector(
  ".watch-user-video__side-video-container"
);

const makeComment = (commentInfo) => {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("user-video-comment");
  const avatarLink = document.createElement("a");
  avatarLink.href = `/users/${commentInfo.userId}`;
  const avatarImg = document.createElement("img");
  avatarImg.classList.add("user-video-comment__comment-avatar");
  avatarImg.src = commentInfo.avatarUrl;
  avatarLink.appendChild(avatarImg);
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("user-video-comment__container");
  containerDiv.dataset.id = commentInfo.id;
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
  textSpan.classList.add("user-video-comment__text");
  textSpan.innerText = commentInfo.text;

  const updateDiv = document.createElement("div");
  updateDiv.classList.add("user-video-comment__update");
  updateDiv.classList.add("display-none");

  const updateInput = document.createElement("input");
  updateInput.setAttribute("type", "text");
  updateInput.classList.add("user-video-comment__update-text");
  updateInput.value = commentInfo.text;

  const updateSaveBtn = document.createElement("button");
  updateSaveBtn.classList.add("user-video-comment__update-save-btn");
  updateSaveBtn.innerText = "저장";
  updateSaveBtn.addEventListener("click", updateSaveHandler);

  const stateBtnsDiv = document.createElement("div");
  stateBtnsDiv.classList.add("user-video-comment__state-btn");
  stateBtnsDiv.dataset.id = commentInfo.id;
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("user-video-comment__like-btn");
  likeBtn.addEventListener("click", likeCommentHandler);

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
  const updateBtn = document.createElement("button");
  updateBtn.innerText = "수정";
  updateBtn.classList.add("user-video-comment__update-btn");
  updateBtn.addEventListener("click", updateInputVisiableHandler);
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "삭제";
  deleteBtn.classList.add("user-video-comment__delete-btn");
  deleteBtn.addEventListener("click", deleteCommentHandler);
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
  addSubSpan2.classList.add("user-video-comment__sub-comment-count");
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
  stateBtnsDiv.appendChild(updateBtn);
  stateBtnsDiv.appendChild(deleteBtn);

  updateDiv.appendChild(updateInput);
  updateDiv.appendChild(updateSaveBtn);

  containerDiv.appendChild(nicknameSpan);
  containerDiv.appendChild(textSpan);
  containerDiv.appendChild(updateDiv);
  containerDiv.appendChild(stateBtnsDiv);
  containerDiv.appendChild(subContainerDiv);
  containerDiv.appendChild(subDiv);

  commentDiv.appendChild(avatarLink);
  commentDiv.appendChild(containerDiv);

  return commentDiv;
};

const scrollAddComment = (comment, isLiked, likeCount, subCommentCount) => {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("user-video-comment");
  const avatarLink = document.createElement("a");
  avatarLink.href = `/users/${comment.owner._id}`;
  const avatarImg = document.createElement("img");
  avatarImg.classList.add("user-video-comment__comment-avatar");
  avatarImg.src = comment.owner.avatar_url;
  avatarLink.appendChild(avatarImg);
  const containerDiv = document.createElement("div");
  containerDiv.classList.add("user-video-comment__container");
  containerDiv.dataset.id = comment._id;
  const nicknameSpan = document.createElement("span");
  nicknameSpan.innerText = `${comment.owner.nickname} • ${new Date(
    comment.create_at
  ).toLocaleDateString("ko-kr", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
  })}`;
  const textSpan = document.createElement("span");
  textSpan.classList.add("user-video-comment__text");
  textSpan.innerText = comment.text;

  const updateDiv = document.createElement("div");
  updateDiv.classList.add("user-video-comment__update");
  updateDiv.classList.add("display-none");

  const updateInput = document.createElement("input");
  updateInput.setAttribute("type", "text");
  updateInput.classList.add("user-video-comment__update-text");
  updateInput.value = comment.text;

  const updateSaveBtn = document.createElement("button");
  updateSaveBtn.classList.add("user-video-comment__update-save-btn");
  updateSaveBtn.innerText = "저장";
  updateSaveBtn.addEventListener("click", updateSaveHandler);

  const stateBtnsDiv = document.createElement("div");
  stateBtnsDiv.classList.add("user-video-comment__state-btn");
  stateBtnsDiv.dataset.id = comment._id;
  const likeBtn = document.createElement("button");
  likeBtn.classList.add("user-video-comment__like-btn");
  const likeI = document.createElement("i");
  if (isLiked) {
    likeI.classList.add("fas");
    likeBtn.addEventListener("click", unlikeCommentHandler);
  } else {
    likeI.classList.add("far");
    likeBtn.addEventListener("click", likeCommentHandler);
  }
  likeI.classList.add("fa-thumbs-up");
  likeI.classList.add("fa-lg");
  const likeCntSpan = document.createElement("span");
  likeCntSpan.innerText = likeCount;
  const answerBtn = document.createElement("button");
  answerBtn.innerText = "답글";
  answerBtn.classList.add("user-video-comment__sub-visible-btn");
  answerBtn.addEventListener("click", subCommentInputVisibleHandler);
  const updateBtn = document.createElement("button");
  updateBtn.innerText = "수정";
  updateBtn.classList.add("user-video-comment__update-btn");
  updateBtn.addEventListener("click", updateInputVisiableHandler);
  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "삭제";
  deleteBtn.classList.add("user-video-comment__delete-btn");
  deleteBtn.addEventListener("click", deleteCommentHandler);
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
  commentBtn.dataset.id = comment._id;
  commentBtn.addEventListener("click", submitSubCommentHandler);
  const subDiv = document.createElement("div");
  subDiv.classList.add("user-video-comment-sub");
  const addSubBtn = document.createElement("button");
  addSubBtn.classList.add("user-video-comment__add-sub-comment-btn");
  addSubBtn.dataset.id = comment._id;
  addSubBtn.addEventListener("click", addSubCommentHandler);
  const addSubI = document.createElement("i");
  addSubI.classList.add("fas");
  addSubI.classList.add("fa-caret-down");
  addSubI.classList.add("fa-lg");
  const addSubSpan1 = document.createElement("span");
  addSubSpan1.innerText = "답글";
  const addSubSpan2 = document.createElement("span");
  addSubSpan2.innerText = subCommentCount;
  addSubSpan2.classList.add("user-video-comment__sub-comment-count");
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

  if (userIdDiv.dataset._id === comment.owner._id) {
    likeBtn.appendChild(likeI);
    likeBtn.appendChild(likeCntSpan);
    stateBtnsDiv.appendChild(likeBtn);
    stateBtnsDiv.appendChild(answerBtn);
    stateBtnsDiv.appendChild(updateBtn);
    stateBtnsDiv.appendChild(deleteBtn);
  }

  updateDiv.appendChild(updateInput);
  updateDiv.appendChild(updateSaveBtn);

  containerDiv.appendChild(nicknameSpan);
  containerDiv.appendChild(textSpan);
  containerDiv.appendChild(updateDiv);

  if (userIdDiv.dataset._id === comment.owner._id) {
    containerDiv.appendChild(stateBtnsDiv);
  }
  containerDiv.appendChild(subContainerDiv);
  containerDiv.appendChild(subDiv);

  commentDiv.appendChild(avatarLink);
  commentDiv.appendChild(containerDiv);

  return commentDiv;
};

const makeSubComments = (likeCounts, subComments, isLikes, parentElement) => {
  const length = subComments.length;

  for (let i = 0; i < length; ++i) {
    makeSubComment(likeCounts[i], subComments[i], isLikes[i], parentElement);
  }
};

const makeSubComment = (likeCount, subComment, isLike, parentElement) => {
  const subComDiv = document.createElement("div");
  const avatar = document.createElement("img");
  const subUserDiv = document.createElement("div");
  const subUserInfoDiv = document.createElement("div");
  const infoSpan = document.createElement("span");
  const infoDiv = document.createElement("div");
  infoDiv.classList.add("user-video-sub-comment__text-container");
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
  const updateDiv = document.createElement("div");
  updateDiv.classList.add("display-none");
  const updateInput = document.createElement("input");
  updateInput.setAttribute("type", "text");
  updateInput.classList.add("user-video-sub-comment__update-text");
  updateInput.value = subComment.text;
  const updateSaveBtn = document.createElement("button");
  updateSaveBtn.innerText = "저장";
  updateSaveBtn.classList.add("user-video-sub-comment__update-save-btn");
  updateSaveBtn.addEventListener("click", updateSaveSubCommentHandler);
  updateDiv.classList.add("user-video-sub-comment__update");

  updateDiv.appendChild(updateInput);
  updateDiv.appendChild(updateSaveBtn);

  subComDiv.classList.add("user-video-sub-comment");
  avatar.classList.add("user-video-sub-comment__avatar");
  subUserDiv.classList.add("user-video-sub-comment__user");
  subUserDiv.dataset.id = subComment._id;
  subUserInfoDiv.classList.add("user-video-sub-comment__user-info");
  infoDivTextSpan.classList.add("user-video-sub-comment__text");
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

  if (isLike) {
    thumbIcon.classList.add("fas");
    subBtn1.addEventListener("click", unlikeSubCommentHandler);
  } else {
    thumbIcon.classList.add("far");
    subBtn1.addEventListener("click", likeSubCommentHandler);
  }
  subBtn2.addEventListener("click", subCommentInputVisibleHandler);

  thumbIcon.classList.add("fa-thumbs-up");
  thumbIcon.classList.add("fa-lg");

  const avatarLink = document.createElement("a");
  avatarLink.href = `/users/${subComment.owner._id}`;
  avatar.src = subComment.owner.avatar_url;
  avatarLink.appendChild(avatar);
  infoSpan.innerText = `${subComment.owner.nickname} • ${new Date(
    subComment.create_at
  ).toLocaleDateString("ko-kr", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
  })}`;
  infoDivTextSpan.innerText = subComment.text;
  likeSpan.innerText = likeCount;
  subBtn2.innerText = "답글";
  subBtn1.dataset.id = subComment._id;
  userTagSpan.dataset.id = subComment.owner._id;
  userTagSpan.innerText = `@${subComment.owner.nickname}`;
  subCommentBtn.innerText = "댓글";

  subCommentBtn.dataset.id = subComment.comment;
  subCommentBtn.addEventListener("click", submitTagSubCommentHandler);

  subBtn1.appendChild(thumbIcon);
  subBtn1.appendChild(likeSpan);

  if (subComment.to_user) {
    infoDivTextTag.innerText = `@${subComment.to_user.nickname}`;
    infoDivTextTag.classList.add("user-video-sub-comment__tag-text");
  }
  infoDiv.appendChild(infoDivTextTag);
  infoDiv.appendChild(infoDivTextSpan);

  if (userIdDiv.dataset.id) {
    subCommentBtnsDiv.appendChild(subBtn1);
    subCommentBtnsDiv.appendChild(subBtn2);
  }

  if (userIdDiv.dataset.id === subComment.owner._id) {
    const updateBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");
    updateBtn.innerText = "수정";
    updateBtn.classList.add("user-video-sub-comment__update-btn");
    updateBtn.addEventListener("click", updateSubInputVisiableHandler);
    deleteBtn.innerText = "삭제";
    deleteBtn.dataset.id = subComment._id;
    deleteBtn.addEventListener("click", deleteSubCommentHandler);
    subCommentBtnsDiv.appendChild(updateBtn);
    subCommentBtnsDiv.appendChild(deleteBtn);
  }

  subUserInfoDiv.appendChild(infoSpan);
  subUserInfoDiv.appendChild(infoDiv);
  subUserInfoDiv.appendChild(updateDiv);

  subContainerDiv.appendChild(userTagSpan);
  subContainerDiv.appendChild(subDiv);

  subUserDiv.appendChild(subUserInfoDiv);
  subUserDiv.appendChild(subCommentBtnsDiv);
  subUserDiv.appendChild(subContainerDiv);

  subDiv.appendChild(subCommentInput);
  subDiv.appendChild(subCommentBtn);

  subComDiv.appendChild(avatarLink);
  subComDiv.appendChild(subUserDiv);

  parentElement.appendChild(subComDiv);
};

const makeSideUserVideo = (video) => {
  const a = document.createElement("a");
  a.classList.add("side-user-video-mixin");
  a.href = `/user-videos/${video._id}`;

  const thumbnaile = document.createElement("img");
  thumbnaile.classList.add("side-user-video-mixin__thumb");
  if (video.thumbnail_url.startsWith("http")) {
    thumbnaile.src = `${video.thumbnail_url}`;
  } else {
    thumbnaile.src = `/${video.thumbnail_url}`;
  }

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("side-user-video-mixin__info");

  const titleSpan = document.createElement("span");
  titleSpan.classList.add("side-user-video-mixin__title");
  titleSpan.innerText = video.title;

  const nickAndViews = document.createElement("span");
  nickAndViews.innerText = `${video.owner.nickname} • ${video.views}회`;

  const dateSpan = document.createElement("span");
  dateSpan.innerText = `${new Date(video.create_at).toLocaleDateString(
    "ko-kr",
    { year: "numeric", month: "long", day: "numeric" }
  )}`;

  infoDiv.appendChild(titleSpan);
  infoDiv.appendChild(nickAndViews);
  infoDiv.appendChild(dateSpan);

  a.appendChild(thumbnaile);
  a.appendChild(infoDiv);

  return a;
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
const submitCommentHandler = async (event) => {
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
  uservideoCommentMixDiv.prepend(makeComment(result));

  numberOfComment.innerText = Number(numberOfComment.innerText) + 1;
  commentInput.value = "";
};

const deleteCommentHandler = async (event) => {
  let {
    target: { parentElement },
  } = event;
  const {
    target: {
      parentElement: {
        dataset: { id },
      },
    },
  } = event;

  const res = await userVideoApi.deleteVideoComment(id);
  if (res.status !== 200) {
    return;
  }

  let commentContainer = parentElement;
  while (
    !commentContainer.classList.contains("user-video-comment__container")
  ) {
    commentContainer = commentContainer.parentElement;
  }
  const subCountSpan = commentContainer.querySelector(
    ".user-video-comment__sub-comment-count"
  );

  while (!parentElement.classList.contains("user-video-comment")) {
    parentElement = parentElement.parentElement;
  }

  uservideoCommentMixDiv.removeChild(parentElement);
  numberOfComment.innerText -= Number(subCountSpan.innerText) + 1;
};

const updateInputVisiableHandler = async (event) => {
  const { target } = event;
  let {
    target: { parentElement },
  } = event;

  while (!parentElement.classList.contains("user-video-comment__container")) {
    parentElement = parentElement.parentElement;
  }

  const textSpan = parentElement.querySelector(".user-video-comment__text");
  const updateDiv = parentElement.querySelector(".user-video-comment__update");

  textSpan.classList.add("display-none");
  updateDiv.classList.remove("display-none");

  target.removeEventListener("click", updateInputVisiableHandler);
  target.addEventListener("click", updateInputInvisiableHandler);
};

const updateInputInvisiableHandler = async (event) => {
  const { target } = event;
  let {
    target: { parentElement },
  } = event;

  while (!parentElement.classList.contains("user-video-comment__container")) {
    parentElement = parentElement.parentElement;
  }

  const textSpan = parentElement.querySelector(".user-video-comment__text");
  const updateDiv = parentElement.querySelector(".user-video-comment__update");

  textSpan.classList.remove("display-none");
  updateDiv.classList.add("display-none");

  target.removeEventListener("click", updateInputInvisiableHandler);
  target.addEventListener("click", updateInputVisiableHandler);
};

const updateSubInputVisiableHandler = async (event) => {
  const { target } = event;
  let {
    target: { parentElement },
  } = event;

  while (!parentElement.classList.contains("user-video-sub-comment__user")) {
    parentElement = parentElement.parentElement;
  }

  console.log(parentElement);

  const textContainer = parentElement.querySelector(
    ".user-video-sub-comment__text-container"
  );
  const updateContainer = parentElement.querySelector(
    ".user-video-sub-comment__update"
  );

  textContainer.classList.add("display-none");
  updateContainer.classList.remove("display-none");

  target.removeEventListener("click", updateSubInputVisiableHandler);
  target.addEventListener("click", updateSubInputInvisiableHandler);
};

const updateSubInputInvisiableHandler = async (event) => {
  const { target } = event;
  let {
    target: { parentElement },
  } = event;

  while (!parentElement.classList.contains("user-video-sub-comment__user")) {
    parentElement = parentElement.parentElement;
  }

  const textContainer = parentElement.querySelector(
    ".user-video-sub-comment__text-container"
  );
  const updateContainer = parentElement.querySelector(
    ".user-video-sub-comment__update"
  );

  textContainer.classList.remove("display-none");
  updateContainer.classList.add("display-none");

  target.removeEventListener("click", updateSubInputInvisiableHandler);
  target.addEventListener("click", updateSubInputVisiableHandler);
};

const updateSaveSubCommentHandler = async (event) => {
  let {
    target: { parentElement },
  } = event;

  while (!parentElement.classList.contains("user-video-sub-comment__user")) {
    parentElement = parentElement.parentElement;
  }
  const subCommentInput = parentElement.querySelector(
    ".user-video-sub-comment__update-text"
  );

  const text = subCommentInput.value;
  const subCommentId = parentElement.dataset.id;
  const result = await userVideoApi.updateSubComment(subCommentId, text);
  if (result.status !== 200) {
    return;
  }

  const subCommentTextSpan = parentElement.querySelector(
    ".user-video-sub-comment__text"
  );
  subCommentTextSpan.innerText = text;
  const updateBtn = parentElement.querySelector(
    ".user-video-sub-comment__update-btn"
  );

  updateBtn.click();
};

const updateSaveHandler = async (event) => {
  let {
    target: { parentElement },
  } = event;

  let commentContainer = parentElement;
  while (
    !commentContainer.classList.contains("user-video-comment__container")
  ) {
    commentContainer = commentContainer.parentElement;
  }

  const commentId = commentContainer.dataset.id;
  const textSpan = commentContainer.querySelector(".user-video-comment__text");
  const updateTextInput = commentContainer.querySelector(
    ".user-video-comment__update-text"
  );
  const updateText = updateTextInput.value;

  const result = await userVideoApi.updateVideoComment(commentId, updateText);
  if (result.status !== 200) {
    return;
  }

  const updateBtn = commentContainer.querySelector(
    ".user-video-comment__update-btn"
  );
  textSpan.innerText = updateText;
  updateBtn.click();
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
  let {
    target: { parentElement },
  } = event;
  const {
    target: {
      previousSibling,
      dataset: { id },
    },
  } = event;

  const commentId = id;
  const text = previousSibling.value;
  const res = await userVideoApi.videoCommentAddSub(commentId, text);
  if (res.status !== 200) {
    return;
  }

  const resultObj = await res.json();
  const subComment = {
    owner: {
      _id: resultObj.owner._id,
      nickname: resultObj.owner.nickname,
      avatar_url: resultObj.owner.avatar_url,
    },
    _id: resultObj._id,
    text,
    create_at: resultObj.create_at,
    comment: commentId,
  };

  let containerDiv = parentElement;
  while (!containerDiv.classList.contains("user-video-comment__container")) {
    containerDiv = containerDiv.parentElement;
  }
  const icon = containerDiv.querySelector(".fa-caret-up");
  const subCommentSection = containerDiv.lastChild;

  if (icon) {
    makeSubComment(0, subComment, false, subCommentSection);
  }
  numberOfComment.innerText = Number(numberOfComment.innerText) + 1;
  const countSpan = containerDiv.querySelector(
    ".user-video-comment__sub-comment-count"
  );
  countSpan.innerText = Number(countSpan.innerText) + 1;
  previousSibling.value = "";
};

const submitTagSubCommentHandler = async (event) => {
  const {
    target: {
      previousSibling,
      parentElement,
      dataset: { id },
    },
  } = event;

  const commentId = id;
  const text = previousSibling.value;
  const toUserId = parentElement.previousSibling.dataset.id;
  const toUserNickname = parentElement.previousSibling.innerText;
  const res = await userVideoApi.videoCommentAddSub(commentId, text, toUserId);
  if (res.status !== 200) {
    return;
  }

  const resultObj = await res.json();
  const subComment = {
    owner: {
      _id: resultObj.owner._id,
      nickname: resultObj.owner.nickname,
      avatar_url: resultObj.owner.avatar_url,
    },
    _id: resultObj._id,
    text,
    create_at: resultObj.create_at,
    comment: commentId,
  };

  let containerDiv = parentElement;
  while (!containerDiv.classList.contains("user-video-comment__container")) {
    containerDiv = containerDiv.parentElement;
  }

  const subCommentSection = containerDiv.lastChild;

  subComment.to_user = {
    nickname: toUserNickname.substring(1),
  };
  makeSubComment(0, subComment, false, subCommentSection);

  numberOfComment.innerText = Number(numberOfComment.innerText) + 1;
  const countSpan = containerDiv.querySelector(
    ".user-video-comment__sub-comment-count"
  );
  countSpan.innerText = Number(countSpan.innerText) + 1;
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

const deleteSubCommentHandler = async (event) => {
  let {
    target: { parentElement },
  } = event;
  const {
    target: {
      dataset: { id },
    },
  } = event;

  const res = await userVideoApi.deleteSubComment(id);
  if (res.status !== 200) {
    return;
  }

  let containerDiv = parentElement;
  while (!containerDiv.classList.contains("user-video-comment__container")) {
    containerDiv = containerDiv.parentElement;
  }
  const subCommentCount = containerDiv.querySelector(
    ".user-video-comment__sub-comment-count"
  );

  while (!parentElement.classList.contains("user-video-sub-comment")) {
    parentElement = parentElement.parentElement;
  }

  const subCommentContainer = parentElement.parentElement;
  subCommentContainer.removeChild(parentElement);

  subCommentCount.innerText = Number(subCommentCount.innerText) - 1;
  numberOfComment.innerText = Number(numberOfComment.innerText) - 1;
};

const endScrollEventHandler = (() => {
  let count = 1;
  let eventFlag = true;
  const videoId = videoContainer.dataset.id;
  return async () => {
    if (
      eventFlag &&
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight
    ) {
      eventFlag = false;
      const config = { count };
      const params = new URLSearchParams(config).toString();
      const result = await fetch(`/api/user-video/${videoId}/scroll?${params}`);
      if (result.status !== 200) {
        return;
      }

      const obj = await result.json();
      if (obj.comments.length === 0) {
        return;
      }
      for (let i = 0; i < obj.comments.length; ++i) {
        uservideoCommentMixDiv.appendChild(
          scrollAddComment(
            obj.comments[i],
            obj.commentInfo.isLiked[i],
            obj.commentInfo.likeCounts[i],
            obj.commentInfo.subCommentCounts[i]
          )
        );

        numberOfComment.innerText =
          Number(numberOfComment.innerText) +
          obj.commentInfo.subCommentCounts[i] +
          1;
      }
      ++count;
      eventFlag = true;
    }
  };
})();

const endSideVideoScrollEventHandler = (() => {
  let scrollEvent = true;
  let count = 1;
  const videoId = videoContainer.dataset.id;
  const userId = userInfo.dataset.id;
  return async () => {
    if (
      scrollEvent &&
      sideVideoContainer.scrollTop + sideVideoContainer.clientHeight + 10 >=
        sideVideoContainer.scrollHeight
    ) {
      scrollEvent = false;
      const result = await userVideoApi.getSideVideo(userId, videoId, count);
      if (result.status !== 200) {
        return;
      }
      const sideVideos = await result.json();
      if (sideVideos.length === 0) {
        return 0;
      }
      for (let sideVideo of sideVideos) {
        sideVideoContainer.appendChild(makeSideUserVideo(sideVideo));
      }
      scrollEvent = true;
      ++count;
    }
  };
})();

userVideo.addEventListener("play", playVideoHandler);
userVideo.addEventListener("ended", endVideoHandler);
window.addEventListener("keydown", keyEventHandler);

if (videoLikeBtn) {
  if (videoLikeBtn.classList.contains("clicked")) {
    videoLikeBtn.addEventListener("click", unlikeVideoHandler);
  } else {
    videoLikeBtn.addEventListener("click", likeVideoHandler);
  }
}

if (subscribeBtn) {
  if (subscribeBtn.classList.contains("clicked")) {
    subscribeBtn.addEventListener("click", unsubscribeHandler);
  } else {
    subscribeBtn.addEventListener("click", subscribeHandler);
  }
}

if (commentBtn) {
  commentBtn.addEventListener("click", submitCommentHandler);
}

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

for (let commentUpdateBtn of commentUpdateBtns) {
  commentUpdateBtn.addEventListener("click", updateInputVisiableHandler);
}

for (let commentDeleteBtn of commentDeleteBtns) {
  commentDeleteBtn.addEventListener("click", deleteCommentHandler);
}

for (let commentUpdateSaveBtn of commentUpdateSaveBtns) {
  commentUpdateSaveBtn.addEventListener("click", updateSaveHandler);
}

window.addEventListener("scroll", endScrollEventHandler);
sideVideoContainer.addEventListener("scroll", endSideVideoScrollEventHandler);
