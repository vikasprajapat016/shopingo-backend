import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/products";

// ensure folder exists (safe )
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (_, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg" , "image/webp",   "image/avif", ];
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

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter,
});

export const uploadSingleImage = (req, res, next) => {
  upload.single("thumbnail")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};
