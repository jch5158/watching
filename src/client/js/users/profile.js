import userApi from "../modules/userApi";
import userVideoApi from "../modules/userVideoApi";

const profileHeaderDiv = document.querySelector(".profile-header");
const subscribeBtn = document.querySelector(".profile-header__subscribe-btn");
const userSubscriberDiv = document.querySelector(".user-subscriber");
const videoGrid = document.querySelector(".user-video-grid");

const makeSubscriber = (subscriber) => {
  const subscriberDiv = document.createElement("div");
  subscriberDiv.classList.add("subscriber");
  const link1 = document.createElement("a");
  link1.href = `/users/${subscriber._id}`;
  const avatar = document.createElement("img");
  avatar.classList.add("subscriber__avatar");
  if (subscriber.avatar_url.startsWith("http")) {
    avatar.src = subscriber.avatar_url;
  } else {
    avatar.src = `/${subscriber.avatar_url}`;
  }
  const link2 = document.createElement("a");
  link2.href = `/users/${subscriber._id}`;
  const nickSpan = document.createElement("span");
  nickSpan.classList.add("subscriber__nickname");
  nickSpan.innerText = subscriber.nickname;

  link1.appendChild(avatar);
  link2.appendChild(nickSpan);

  subscriberDiv.appendChild(link1);
  subscriberDiv.appendChild(link2);

  return subscriberDiv;
};

const makeVideo = (video) => {
  const mixinDiv = document.createElement("div");
  mixinDiv.classList.add("user-video-mixin");

  const videoLink = document.createElement("a");
  videoLink.href = `/user-videos/${video._id}`;
  const thumbImg = document.createElement("img");
  thumbImg.classList.add("user-video-mixin__thumb");

  if (video.thumbnail_url.startsWith("http")) {
    thumbImg.src = video.thumbnail_url;
  } else {
    thumbImg.src = `/${video.thumbnail_url}`;
  }

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

const subscribeHandler = async (event) => {
  const {
    target: {
      dataset: { id },
    },
  } = event;

  const result = await userApi.subscribe(id);
  if (result.status !== 200) {
    return;
  }

  location.reload();
};

const unsubscribeHandler = async (event) => {
  const {
    target: {
      dataset: { id },
    },
  } = event;

  const result = await userApi.unsubscribe(id);
  if (result.status !== 200) {
    return;
  }

  location.reload();
};

const scrollEventHandler = (() => {
  let count = 1;
  let eventFlag = true;
  const channelId = profileHeaderDiv.dataset.id;
  return async (event) => {
    if (
      eventFlag &&
      userSubscriberDiv.scrollLeft + userSubscriberDiv.clientWidth + 10 >=
        userSubscriberDiv.scrollWidth
    ) {
      eventFlag = false;
      const result = await userApi.getVerticalSubscriber(channelId, count);
      if (result.status !== 200) {
        return;
      }
      const obj = await result.json();
      if (obj.users.length === 0) {
        return;
      }
      for (let users of obj.users) {
        userSubscriberDiv.appendChild(makeSubscriber(users));
      }
      eventFlag = true;
      ++count;
    }
  };
})();

const videoScrollEventHandler = (() => {
  let count = 1;
  let eventFlag = true;
  const channelId = profileHeaderDiv.dataset.id;
  return async (event) => {
    if (
      eventFlag &&
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight
    ) {
      eventFlag = false;

      const result = await userVideoApi.getScrollProfileVideos(
        count,
        channelId
      );
      if (result.status !== 200) {
        return;
      }

      const videos = await result.json();
      if (videos.length === 0) {
        return;
      }

      for (let video of videos) {
        videoGrid.appendChild(makeVideo(video));
      }

      eventFlag = true;
      ++count;
    }
  };
})();

userSubscriberDiv.addEventListener("scroll", scrollEventHandler);

if (subscribeBtn) {
  if (subscribeBtn.classList.contains("clicked")) {
    subscribeBtn.addEventListener("click", unsubscribeHandler);
  } else {
    subscribeBtn.addEventListener("click", subscribeHandler);
  }
}

window.addEventListener("scroll", videoScrollEventHandler);
