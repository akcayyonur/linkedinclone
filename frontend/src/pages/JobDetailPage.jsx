import { useParams, Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { 
  Building, MapPin, Clock, Calendar, Briefcase, DollarSign, 
  Bookmark, BookmarkCheck, Edit, Trash2, Send, Loader 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useState } from "react";
import Sidebar from "../components/Sidebar";

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState("");
  
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: jobData, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${jobId}`);
      return res.data;
    }
  });
  
  const { mutate: toggleSaveJob } = useMutation({
    mutationFn: () => axiosInstance.post(`/jobs/${jobId}/save`),
    onSuccess: () => {
      queryClient.invalidateQueries(["job", jobId]);
      queryClient.invalidateQueries(["savedJobs"]);
      toast.success(isSaved ? "Job removed from saved jobs" : "Job saved successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  });
  
  const { mutate: applyForJob, isPending: isApplying } = useMutation({
    mutationFn: (data) => axiosInstance.post(`/jobs/${jobId}/apply`, data),
    onSuccess: () => {
      toast.success("Application submitted successfully");
      queryClient.invalidateQueries(["job", jobId]);
      setShowApplyForm(false);
      setCoverLetter("");
      setResume("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit application");
    }
  });
  
  const { mutate: deleteJob, isPending: isDeleting } = useMutation({
    mutationFn: () => axiosInstance.delete(`/jobs/${jobId}`),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      navigate("/jobs");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete job");
    }
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]">
      <Loader className="animate-spin h-8 w-8 text-primary" />
    </div>;
  }
  
  if (!jobData) {
    return <div className="text-center py-10">Job not found</div>;
  }
  
  const isOwner = jobData.postedBy?._id === authUser?._id;
  const isSaved = jobData.savedBy?.includes(authUser?._id);
  const hasApplied = jobData.applications?.some(app => app.user === authUser?._id);
  
  const handleApply = () => {
    if (hasApplied) {
      toast.error("You have already applied for this job");
      return;
    }
    setShowApplyForm(true);
  };
  
  const handleSubmitApplication = (e) => {
    e.preventDefault();
    applyForJob({ resume, coverLetter });
  };
  
  const handleDeleteJob = () => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      deleteJob();
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">{jobData.title}</h1>
              <div className="flex items-center text-gray-600 mt-2">
                <Building size={18} className="mr-1" />
                <span className="mr-4">{jobData.company}</span>
                <MapPin size={18} className="mr-1" />
                <span>{jobData.location}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {!isOwner && (
                <button 
                  onClick={() => toggleSaveJob()}
                  className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                >
                  {isSaved ? (
                    <>
                      <BookmarkCheck className="text-primary fill-primary" size={18} />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark size={18} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              )}
              
              {isOwner && (
                <>
                  <Link 
                    to={`/jobs/${jobId}/edit`}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                  >
                    <Edit size={18} />
                    <span>Edit</span>
                  </Link>
                  
                  <button 
                    onClick={handleDeleteJob}
                    className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50 text-red-500"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <Loader className="animate-spin" size={18} /> : <Trash2 size={18} />}
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              <Briefcase size={16} className="mr-1" />
              <span>{jobData.jobType}</span>
            </div>
            
            {jobData.salary && (
              <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                <DollarSign size={16} className="mr-1" />
                <span>{jobData.salary}</span>
              </div>
            )}
            
            <div className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              <Clock size={16} className="mr-1" />
              <span>Posted {formatDistanceToNow(new Date(jobData.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Job Description</h2>
            <p className="whitespace-pre-line">{jobData.description}</p>
          </div>
          
          {jobData.requirements && jobData.requirements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <ul className="list-disc pl-5 space-y-1">
                {jobData.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">About the company</h2>
            <div className="flex items-start">
              <Link to={`/profile/${jobData.postedBy?.username}`}>
                <img 
                  src={jobData.postedBy?.profilePicture || "/avatar.png"} 
                  alt={jobData.postedBy?.name} 
                  className="w-12 h-12 rounded-full mr-3"
                />
              </Link>
              
              <div>
                <Link 
                  to={`/profile/${jobData.postedBy?.username}`} 
                  className="font-semibold hover:underline"
                >
                  {jobData.postedBy?.name}
                </Link>
                <p className="text-gray-600">{jobData.postedBy?.headline}</p>
              </div>
            </div>
          </div>
          
          {!isOwner && !hasApplied && (
            <button 
              onClick={handleApply}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Apply Now
            </button>
          )}
          
          {!isOwner && hasApplied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-700">
              You have already applied for this job
            </div>
          )}
          
          {showApplyForm && (
            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Submit Your Application</h3>
              <form onSubmit={handleSubmitApplication}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Resume/CV Link (optional)</label>
                  <input 
                    type="text" 
                    placeholder="Enter a link to your resume/CV" 
                    className="w-full p-2 border rounded"
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Cover Letter</label>
                  <textarea 
                    placeholder="Why are you a good fit for this role?" 
                    className="w-full p-2 border rounded"
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  ></textarea>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    className="px-4 py-2 border rounded-lg"
                    onClick={() => setShowApplyForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    disabled={isApplying}
                  >
                    {isApplying ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;