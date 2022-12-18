import fs from "fs";

const basePath = "./uploads";

const existsAndMkdir = (path) => {
  const dirExists = fs.existsSync(path);
  if (dirExists) {
    return;
  }
  fs.mkdirSync(path);
};

(function () {
  existsAndMkdir(basePath);
})();

(function () {
  existsAndMkdir(`${basePath}/avatars`);
})();
