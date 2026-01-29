import express from "express";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import upload from "../config/multer.js";
import User from "../models/User.js";

const router = express.Router();

router.post(
    "/upload-doc",
    protect,
    authorize("DRIVER"),
    upload.single("document"),
    async (req, res) => {

        try {

            if(!req.file) {
                return res.status(400).json({message : "No File Uploaded"});
            }

            await User.findByIdAndUpdate(req.user._id, {
                documentsUploaded : true
            });

            res.json({message : "Document uploaded Successfully"});

        } catch (error){
            res.status(500).json({message : "Upload Failed"});
        }

    }
);

export default router;