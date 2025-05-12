import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
		},
		company: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		requirements: [String],
		salary: {
			type: String,
		},
		jobType: {
			type: String,
			enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
			default: "Full-time",
		},
		postedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		applications: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				resume: {
					type: String,
				},
				coverLetter: {
					type: String,
				},
				status: {
					type: String,
					enum: ["pending", "under-review", "accepted", "rejected"],
					default: "pending",
				},
				appliedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		savedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);

export default Job;