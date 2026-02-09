import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/driver-docs";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}-${file.fieldname}${ext}`);
  },
});

export const uploadDriverDocs = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
