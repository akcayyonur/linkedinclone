import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

// Get all jobs
export const getAllJobs = async (req, res) => {
	try {
		const jobs = await Job.find({ isActive: true })
			.populate("postedBy", "name username profilePicture")
			.sort({ createdAt: -1 });

		res.status(200).json(jobs);
	} catch (error) {
		console.error("Error in getAllJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get job by id
export const getJobById = async (req, res) => {
	try {
		const jobId = req.params.id;
		const job = await Job.findById(jobId)
			.populate("postedBy", "name username profilePicture headline")
			.populate("applications.user", "name username profilePicture");

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		res.status(200).json(job);
	} catch (error) {
		console.error("Error in getJobById controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Create a new job
export const createJob = async (req, res) => {
	try {
		const { title, company, location, description, requirements, salary, jobType } = req.body;

		if (!title || !company || !location || !description) {
			return res.status(400).json({ message: "Required fields missing" });
		}

		const newJob = new Job({
			title,
			company,
			location,
			description,
			requirements: requirements || [],
			salary,
			jobType,
			postedBy: req.user._id,
		});

		await newJob.save();
		res.status(201).json(newJob);
	} catch (error) {
		console.error("Error in createJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update job
export const updateJob = async (req, res) => {
	try {
		const jobId = req.params.id;
		const job = await Job.findById(jobId);

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		// Check if the current user is the job poster
		if (job.postedBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Not authorized to update this job" });
		}

		const updatedJob = await Job.findByIdAndUpdate(
			jobId,
			{ $set: req.body },
			{ new: true }
		);

		res.status(200).json(updatedJob);
	} catch (error) {
		console.error("Error in updateJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Delete job
export const deleteJob = async (req, res) => {
	try {
		const jobId = req.params.id;
		const job = await Job.findById(jobId);

		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		// Check if the current user is the job poster
		if (job.postedBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Not authorized to delete this job" });
		}

		await Job.findByIdAndDelete(jobId);
		res.status(200).json({ message: "Job deleted successfully" });
	} catch (error) {
		console.error("Error in deleteJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Apply for a job
export const applyForJob = async (req, res) => {
	try {
		const jobId = req.params.id;
		const { resume, coverLetter } = req.body;
		const userId = req.user._id;

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		// Check if user already applied
		const alreadyApplied = job.applications.some(
			(app) => app.user.toString() === userId.toString()
		);

		if (alreadyApplied) {
			return res.status(400).json({ message: "You have already applied for this job" });
		}

		// Add application
		job.applications.push({
			user: userId,
			resume,
			coverLetter,
		});

		await job.save();

		// Create notification for job poster
		const newNotification = new Notification({
			recipient: job.postedBy,
			type: "jobApplication",
			relatedUser: userId,
			relatedJob: jobId,
		});

		await newNotification.save();

		res.status(200).json({ message: "Job application submitted successfully" });
	} catch (error) {
		console.error("Error in applyForJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Save/unsave a job
export const toggleSaveJob = async (req, res) => {
	try {
		const jobId = req.params.id;
		const userId = req.user._id;

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		const isSaved = job.savedBy.includes(userId);

		if (isSaved) {
			// Unsave job
			job.savedBy = job.savedBy.filter(
				(id) => id.toString() !== userId.toString()
			);
		} else {
			// Save job
			job.savedBy.push(userId);
		}

		await job.save();

		res.status(200).json({
			message: isSaved ? "Job unsaved successfully" : "Job saved successfully",
		});
	} catch (error) {
		console.error("Error in toggleSaveJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's job applications
export const getUserApplications = async (req, res) => {
	try {
		const userId = req.user._id;

		const jobs = await Job.find({
			"applications.user": userId,
		})
			.populate("postedBy", "name username profilePicture")
			.sort({ createdAt: -1 });

		// Format the response to include only relevant application data
		const applications = jobs.map((job) => {
			const userApplication = job.applications.find(
				(app) => app.user.toString() === userId.toString()
			);
			return {
				job: {
					_id: job._id,
					title: job.title,
					company: job.company,
					location: job.location,
					jobType: job.jobType,
					postedBy: job.postedBy,
					createdAt: job.createdAt,
				},
				application: {
					status: userApplication.status,
					appliedAt: userApplication.appliedAt,
				},
			};
		});

		res.status(200).json(applications);
	} catch (error) {
		console.error("Error in getUserApplications controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get user's saved jobs
export const getSavedJobs = async (req, res) => {
	try {
		const userId = req.user._id;

		const savedJobs = await Job.find({
			savedBy: userId,
			isActive: true,
		})
			.populate("postedBy", "name username profilePicture")
			.sort({ createdAt: -1 });

		res.status(200).json(savedJobs);
	} catch (error) {
		console.error("Error in getSavedJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Get jobs posted by user
export const getPostedJobs = async (req, res) => {
	try {
		const userId = req.user._id;

		const postedJobs = await Job.find({
			postedBy: userId,
		}).sort({ createdAt: -1 });

		res.status(200).json(postedJobs);
	} catch (error) {
		console.error("Error in getPostedJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
	try {
		const { jobId, applicationId, status } = req.body;
		const userId = req.user._id;

		const job = await Job.findById(jobId);
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		// Check if user is the job poster
		if (job.postedBy.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Not authorized to update application status" });
		}

		// Find and update the application
		const application = job.applications.id(applicationId);
		if (!application) {
			return res.status(404).json({ message: "Application not found" });
		}

		application.status = status;
		await job.save();

		// Create notification for applicant
		const newNotification = new Notification({
			recipient: application.user,
			type: "applicationStatus",
			relatedUser: userId,
			relatedJob: jobId,
		});

		await newNotification.save();

		res.status(200).json({ message: "Application status updated successfully" });
	} catch (error) {
		console.error("Error in updateApplicationStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

// Search jobs
export const searchJobs = async (req, res) => {
	try {
		const { query, location, jobType } = req.query;
		
		// Build search filter
		const searchFilter = { isActive: true };
		
		if (query) {
			searchFilter.$or = [
				{ title: { $regex: query, $options: 'i' } },
				{ company: { $regex: query, $options: 'i' } },
				{ description: { $regex: query, $options: 'i' } },
			];
		}
		
		if (location) {
			searchFilter.location = { $regex: location, $options: 'i' };
		}
		
		if (jobType) {
			searchFilter.jobType = jobType;
		}
		
		const jobs = await Job.find(searchFilter)
			.populate("postedBy", "name username profilePicture")
			.sort({ createdAt: -1 });
			
		res.status(200).json(jobs);
	} catch (error) {
		console.error("Error in searchJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};