import fs from "fs/promises";

const fileSystem = (() => {
  const fileSystem = {
    fileExistsAndRemove: async (path) => {
      try {
        await fs.access(path, fs.constants.F_OK);
        await fs.unlink(path);
        return true;
      } catch (err) {
        return false;
      }
    },
  };
  return fileSystem;
})();

export default fileSystem;
