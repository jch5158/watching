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

const videoDuration = document.querySelector(".video-form__video-duration");

changeVideoHandler = (event) => {
  const file = event.target.files[0];
  const { name } = file;
  videoNameSpan.innerText = name;

  var fileReader = new FileReader();
  fileReader.onload = function (e) {
    var video = document.createElement("video");
    video.src = e.target.result;
    video.onloadedmetadata = function () {
      videoDuration.value = video.duration;
    };
  };
  fileReader.readAsDataURL(file);
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

videoInput.addEventListener("change", changeVideoHandler);
videoThumbnailInput.addEventListener("change", changeThumbnailHandler);
hashtagsInput.addEventListener("input", hashtagsInputHandler);
