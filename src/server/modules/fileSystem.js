import fs from "fs/promises";
import fsSync, { appendFile } from "fs";

const fileSystem = (() => {
  const fileSystem = {
    async fileExistsAndRemove(path) {
      try {
        await fs.access(path, fs.constants.F_OK);
        await fs.unlink(path);
        return true;
      } catch (err) {
        return false;
      }
    },

    folderExistsAndCreateSync(path) {
      if (!fsSync.existsSync(path)) {
        fsSync.mkdir(path, (err) => {
          if (err) {
            throw err;
          }
        });
      }
    },

    async appendFile(path, data) {
      try {
        await fs.appendFile(path, `${data}\n`);
      } catch (err) {
        console.log(err);
      }
    },
  };
  return fileSystem;
})();

export default fileSystem;
