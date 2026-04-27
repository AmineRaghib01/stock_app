import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

const dir = path.resolve(process.cwd(), env.uploadDir);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const allowed = /jpeg|jpg|png|gif|webp/i;

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext) || allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Seuls les fichiers image sont autorises"));
  }
}

export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter,
}).single('image');
