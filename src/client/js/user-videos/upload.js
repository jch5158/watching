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
  hashtagsResultSpan.innerText = hashtags
    .replace(/\s/gi, "")
    .split(",")
    .filter((element) => element !== "")
    .slice(0, 5)
    .map((word) => (word.startsWith("#") ? word : `#${word}`))
    .join();
};

videoInput.addEventListener("change", changeVideoHandler);
videoThumbnailInput.addEventListener("change", changeThumbnailHandler);
hashtagsInput.addEventListener("input", hashtagsInputHandler);
