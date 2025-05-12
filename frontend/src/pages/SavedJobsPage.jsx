import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Bookmark, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/JobCard";

const SavedJobsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: savedJobs, isLoading } = useQuery({
    queryKey: ["savedJobs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/jobs/user/saved");
      return res.data;
    }
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <h1 className="text-2xl font-bold mb-6">Saved Jobs</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : savedJobs && savedJobs.length > 0 ? (
          <div>
            {savedJobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bookmark size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Saved Jobs</h3>
            <p className="text-gray-600 mb-4">
              You haven't saved any jobs yet. Browse jobs and bookmark those you're interested in.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobsPage;