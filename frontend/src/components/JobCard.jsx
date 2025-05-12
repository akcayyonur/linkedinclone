import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { Bookmark, BookmarkCheck, MapPin, Clock, Building } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";

const JobCard = ({ job }) => {
	const queryClient = useQueryClient();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	
	const isSaved = job.savedBy?.includes(authUser?._id);
	
	const { mutate: toggleSaveJob } = useMutation({
		mutationFn: () => axiosInstance.post(`/jobs/${job._id}/save`),
		onSuccess: () => {
			queryClient.invalidateQueries(["jobs"]);
			queryClient.invalidateQueries(["savedJobs"]);
			toast.success(isSaved ? "Job removed from saved jobs" : "Job saved successfully");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Something went wrong");
		}
	});
	
	const handleSaveJob = (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleSaveJob();
	};
	
	return (
		<div className="bg-white p-4 rounded-lg shadow-md mb-4 hover:shadow-lg transition-shadow">
			<div className="flex justify-between items-start">
				<div>
					<Link to={`/jobs/${job._id}`} className="text-lg font-semibold text-primary hover:underline">
						{job.title}
					</Link>
					<div className="flex items-center text-gray-600 mt-1">
						<Building size={16} className="mr-1" />
						<span className="mr-3">{job.company}</span>
						<MapPin size={16} className="mr-1" />
						<span>{job.location}</span>
					</div>
					<div className="mt-2 flex flex-wrap gap-2">
						<span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
							{job.jobType}
						</span>
						{job.salary && (
							<span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
								{job.salary}
							</span>
						)}
					</div>
				</div>
				<div className="flex flex-col items-end">
					<button 
						onClick={handleSaveJob}
						className="text-gray-500 hover:text-primary transition-colors"
					>
						{isSaved ? <BookmarkCheck className="fill-primary text-primary" /> : <Bookmark />}
					</button>
					<div className="flex items-center text-gray-500 text-xs mt-2">
						<Clock size={12} className="mr-1" />
						<span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
					</div>
				</div>
			</div>
			
			{job.requirements && job.requirements.length > 0 && (
				<div className="mt-3">
					<p className="text-sm text-gray-600">
						{job.requirements.slice(0, 2).join(' • ')}
						{job.requirements.length > 2 && '...'}
					</p>
				</div>
			)}
			
			<div className="mt-4 flex justify-between items-center">
				<Link 
					to={`/jobs/${job._id}`}
					className="text-primary hover:underline text-sm font-medium"
				>
					View Details
				</Link>
				<div className="flex items-center">
					<img 
						src={job.postedBy?.profilePicture || "/avatar.png"} 
						alt={job.postedBy?.name} 
						className="w-6 h-6 rounded-full mr-2"
					/>
					<Link 
						to={`/profile/${job.postedBy?.username}`} 
						className="text-sm text-gray-600 hover:underline"
					>
						{job.postedBy?.name}
					</Link>
				</div>
			</div>
		</div>
	);
};

export default JobCard;