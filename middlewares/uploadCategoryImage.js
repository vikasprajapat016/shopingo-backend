import multer from "multer";
import path from "path";
import fs from "fs";

const dir = "uploads/category";

const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const categoryId = req.params.id || "temp";

    const uploadPath = path.join(
      process.cwd(),
      "uploads",
      "category",
      categoryId
    );

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

export const categoryUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only images allowed"), false);
  },
});





