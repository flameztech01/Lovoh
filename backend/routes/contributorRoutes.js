import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import {
  applyForContributor,
  getContributorStatus,
  getContributorApplications,
  approveContributor,
  rejectContributor,
} from "../controllers/contributorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Cloudinary config (same pattern as magRoutes)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer setup (memoryStorage for direct Cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed."));
    }
  },
});

// ------------------ User routes ------------------
router.post(
  "/apply",
  protect,
  upload.fields([
    { name: "queryLetterFile", maxCount: 1 },
    { name: "resumeFile", maxCount: 1 },
  ]),
  applyForContributor
);
router.get("/status", protect, getContributorStatus);

// ------------------ Admin routes ------------------
router.get("/applications", protectAdmin, getContributorApplications);
router.put("/approve/:userId", protectAdmin, approveContributor);
router.put("/reject/:userId", protectAdmin, rejectContributor);

export default router;