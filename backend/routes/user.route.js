import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getSuggestedConnections, getPublicProfile, updateProfile, searchUsers } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/search", protectRoute, searchUsers); // Spesifik route'ları önce tanımlıyoruz
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/:username", protectRoute, getPublicProfile); // Parametreli route en sona

router.put("/profile", protectRoute, updateProfile);

export default router;