const videoNameSpan = document.querySelector(".video-form__video-name");
const videoInput = document.querySelector(".video-form__video");

const videoThumbnailImg = document.querySelector(".video-form__thumbnail");
const videoThumbnailInput = document.querySelector(
  ".video-form__video-thumbnail"
);

const hashtagsInput = document.querySelector(".video-form__hashtags");
const hashtagsResultSpan = document.querySelector(
  ".vidoe-form__hashtags-result"
);

const videoForm = document.querySelector(".video-form");
const deleteBtn = document.querySelector(".user-video-edit__delete-btn");

changeVideoHandler = (event) => {
  const { name } = event.target.files[0];
  videoNameSpan.innerText = name;
};

changeThumbnailHandler = (() => {
  let fileUrl;
  return (event) => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    const file = event.target.files[0];
    fileUrl = URL.createObjectURL(file);
    videoThumbnailImg.src = fileUrl;
  };
})();

hashtagsInputHandler = (event) => {
  if (event.data === ",") {
    return;
  }

  const hashtags = hashtagsInput.value;
  hashtagsResultSpan.innerText = [
    ...new Set(
      hashtags
        .replace(/\s/gi, "")
        .split(",")
        .filter((element) => element !== "")
        .slice(0, 5)
        .map((word) => (word.startsWith("#") ? word : `#${word}`))
    ),
  ].join();
};

const deleveVideoHandler = async () => {
  const id = videoForm.dataset.id;
  const userId = videoForm.dataset.user_id;
  const result = confirm("정말로 비디오를 삭제하시겠습니까?");
  if (!result) {
    return;
  }

  const res = await fetch(`/api/user-videos/${id}`, {
    method: "DELETE",
  });

  if (res.status !== 200) {
    alert("비디오 삭제를 할 수 없습니다.");
    return;
  }

  window.location.href = `/users/${userId}`;
};

videoInput.addEventListener("change", changeVideoHandler);
videoThumbnailInput.addEventListener("change", changeThumbnailHandler);
hashtagsInput.addEventListener("input", hashtagsInputHandler);
deleteBtn.addEventListener("click", deleveVideoHandler);
