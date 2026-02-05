import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import platformRoutes from "./routes/platform.routes.js";
import orgAdminRoutes from "./routes/orgAdmin.routes.js";

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/platform", platformRoutes);
app.use("/org-admin", orgAdminRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Backend v1 running");
});

export default app;