import express from "express";
import requireAuth from "../middlewares/auth.middleware.js";
import { uploadDriverDocs } from "../middlewares/upload.middleware.js";
import { uploadDriverDocuments } from "../controllers/driver.controller.js";

const router = express.Router();

router.post(
  "/upload-documents",
  requireAuth,
  uploadDriverDocs.fields([
    { name: "license", maxCount: 1 },
    { name: "rc", maxCount: 1 },
  ]),
  uploadDriverDocuments
);


export default router;
