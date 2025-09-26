import express from "express";
import multer from "multer";
import path from "path";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  getUserProfile,
  updateUserProfile,
  updateProfileImage,
  deleteProfileImage,
  updateUserPreferences,
  deactivateAccount,
  changePassword,
} from "../controllers/user.controller";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  console.log("File details:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(
      new Error(`Only image files are allowed! Received: ${file.mimetype}`),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// All routes require authentication
router.use(authenticateToken);

// User profile routes
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);

// Profile image routes
router.post("/profile/image", upload.single("file"), updateProfileImage);
router.delete("/profile/image", deleteProfileImage);

// User preferences routes
router.put("/preferences", updateUserPreferences);

// Account management routes
router.post("/deactivate", deactivateAccount);
router.put("/change-password", changePassword);

export default router;
