import userVideoApi from "../modules/userVideoApi";

const videoGridDiv = document.querySelector(".user-video-grid");

const makeVideo = (video) => {
  const mixinDiv = document.createElement("div");
  mixinDiv.classList.add("user-video-mixin");

  const videoLink = document.createElement("a");
  videoLink.href = `/user-videos/${video._id}`;
  const thumbImg = document.createElement("img");
  thumbImg.classList.add("user-video-mixin__thumb");
  thumbImg.src = video.thumbnail_url;
  videoLink.appendChild(thumbImg);

  const metaDiv = document.createElement("div");

  metaDiv.classList.add("user-video-mixin__meta");
  const avatarDiv = document.createElement("div");
  const userLink = document.createElement("a");
  userLink.href = `/users/${video.owner._id}`;
  const avatarImg = document.createElement("img");
  avatarImg.classList.add("user-video-mixin__avatar");
  avatarImg.src = video.owner.avatar_url;
  userLink.appendChild(avatarImg);
  avatarDiv.appendChild(userLink);
  metaDiv.appendChild(avatarDiv);

  const infoDiv = document.createElement("div");
  infoDiv.classList.add("user-video-mixin__info");

  const titleLink = document.createElement("a");
  titleLink.classList.add("user-video-mixin__title");
  titleLink.href = `/user-videos/${video._id}`;
  titleLink.innerText = video.title;

  const nicknameDiv = document.createElement("div");
  const userLink2 = document.createElement("a");
  userLink2.href = `/users/${video.owner._id}`;
  userLink2.classList.add("user-video-mixin__nickname");
  const nickSpan = document.createElement("span");
  nickSpan.innerText = video.owner.nickname;
  const dotSpan = document.createElement("span");
  dotSpan.innerText = "• ";
  const videoLink2 = document.createElement("a");
  videoLink2.href = `/user-videos/${video._id}`;
  videoLink2.innerText = `${video.views}회`;

  userLink2.appendChild(nickSpan);
  nicknameDiv.appendChild(userLink2);
  nicknameDiv.appendChild(dotSpan);
  nicknameDiv.appendChild(videoLink2);

  const dateLink = document.createElement("a");
  dateLink.href = `/user-videos/${video._id}`;
  dateLink.innerText = `${new Date(video.create_at).toLocaleDateString(
    "ko-kr",
    { year: "numeric", month: "long", day: "numeric" }
  )}`;

  infoDiv.appendChild(titleLink);
  infoDiv.appendChild(nicknameDiv);
  infoDiv.appendChild(dateLink);

  metaDiv.appendChild(infoDiv);

  mixinDiv.appendChild(videoLink);
  mixinDiv.appendChild(metaDiv);

  return mixinDiv;
};

const endScrollEventHandler = (() => {
  let count = 1;
  let eventFlag = true;
  const videoContainer = document.querySelector(".user-video-container");
  const keyword = videoContainer.dataset.keyword;
  return async () => {
    if (
      eventFlag &&
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight
    ) {
      eventFlag = false;

      const result = await userVideoApi.getVideos(count, keyword);
      if (result.status !== 200) {
        return;
      }

      const videos = await result.json();
      if (videos.length === 0) {
        return;
      }

      for (let video of videos) {
        videoGridDiv.appendChild(makeVideo(video));
      }

      ++count;
      eventFlag = true;
    }
  };
})();

window.addEventListener("scroll", endScrollEventHandler);
