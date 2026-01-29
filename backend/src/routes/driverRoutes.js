import express from "express";
import protect from "../middlewares/authMiddleware.js";
import authorize from "../middlewares/roleMiddleware.js";
import upload from "../config/multer.js";
import User from "../models/User.js";
import requireDriver from "../middlewares/driverMiddleware.js";


const router = express.Router();

router.post(
    "/upload-doc",
    protect,
    requireDriver,
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

router.post(
    "/enable",
    protect,
    async (req, res) => {
      try {
        await User.findByIdAndUpdate(req.user._id, {
          isDriver: true,
        });
  
        res.json({ message: "Driver mode enabled" });
      } catch (error) {
        res.status(500).json({ message: "Failed to enable driver mode" });
      }
    }
  );
  

export default router;