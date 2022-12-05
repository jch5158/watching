import multer from "multer";

export const uploadAvatarMiddleware = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 5242880, // 5MB
  },
});
