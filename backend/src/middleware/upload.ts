import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";

export const uploadsDir = path.join(process.cwd(), "uploads");
export const avatarsDir = path.join(uploadsDir, "avatars");

fs.mkdirSync(avatarsDir, { recursive: true });

const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype];
    const userId = req.userId ?? "anon";
    cb(null, `${userId}-${crypto.randomUUID()}${ext}`);
  },
});

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TO_EXT[file.mimetype]) {
      cb(new Error("Format d'image non supporté (jpeg, png ou webp uniquement)"));
      return;
    }
    cb(null, true);
  },
});
