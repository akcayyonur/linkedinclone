import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	getAllJobs,
	getJobById,
	createJob,
	updateJob,
	deleteJob,
	applyForJob,
	toggleSaveJob,
	getUserApplications,
	getSavedJobs,
	getPostedJobs,
	updateApplicationStatus,
	searchJobs,
} from "../controllers/job.controller.js";

const router = express.Router();

// Get all jobs and search jobs
router.get("/", protectRoute, getAllJobs);
router.get("/search", protectRoute, searchJobs);

// Job CRUD operations
router.post("/create", protectRoute, createJob);
router.get("/:id", protectRoute, getJobById);
router.put("/:id", protectRoute, updateJob);
router.delete("/:id", protectRoute, deleteJob);

// Job application
router.post("/:id/apply", protectRoute, applyForJob);
router.post("/:id/save", protectRoute, toggleSaveJob);
router.put("/application/status", protectRoute, updateApplicationStatus);

// User specific job routes
router.get("/user/applications", protectRoute, getUserApplications);
router.get("/user/saved", protectRoute, getSavedJobs);
router.get("/user/posted", protectRoute, getPostedJobs);

export default router;