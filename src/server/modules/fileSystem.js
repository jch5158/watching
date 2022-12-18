import fs from "fs/promises";

export const fileExistsAndRemove = async (path) => {
  try {
    await fs.access(path, fs.constants.F_OK);
    await fs.unlink(path);
    return true;
  } catch (err) {
    return false;
  }
};
