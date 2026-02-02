import multer from "multer";
import path from "path";
import fs from "fs";
import slugify from "slugify";

/**
 * upload(folderName)
 * example: upload("sliders"), upload("products"), upload("category")
 */
const upload = (folderName) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `uploads/${folderName}`;

      // create folder if not exists
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },


filename: (req, file, cb) => {
  const name = req.body.title || "image";
  const slug = slugify(name, { lower: true, strict: true });

  cb(
    null,
    `${slug}-${Date.now()}${path.extname(file.originalname)}`
  );
}

  });

  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
};

export default upload;
