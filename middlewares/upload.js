import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (_, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only image files are allowed"
      )
    );
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter
});

// 🔥 SAFE WRAPPER (THIS PREVENTS CRASH)
export const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: err.message || "File upload error"
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};
