import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { BriefcaseBusiness, Plus, Loader } from "lucide-react";
import Sidebar from "../components/Sidebar";
import JobSearch from "../components/JobSearch";
import JobCard from "../components/JobCard";

const JobsPage = () => {
  const [searchParams, setSearchParams] = useState({
    query: "",
    location: "",
    jobType: ""
  });
  
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", searchParams],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchParams.query) params.append("query", searchParams.query);
      if (searchParams.location) params.append("location", searchParams.location);
      if (searchParams.jobType) params.append("jobType", searchParams.jobType);
      
      const url = searchParams.query || searchParams.location || searchParams.jobType 
        ? `/jobs/search?${params.toString()}` 
        : "/jobs";
        
      const res = await axiosInstance.get(url);
      return res.data;
    }
  });
  
  const handleSearch = (params) => {
    setSearchParams(params);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
        
        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
          <h2 className="font-semibold mb-4">Job Tools</h2>
          <Link 
            to="/jobs/my-applications" 
            className="flex items-center text-gray-700 hover:text-primary transition-colors py-2"
          >
            <BriefcaseBusiness size={18} className="mr-2" />
            My Applications
          </Link>
          <Link 
            to="/jobs/saved" 
            className="flex items-center text-gray-700 hover:text-primary transition-colors py-2"
          >
            <BriefcaseBusiness size={18} className="mr-2" />
            Saved Jobs
          </Link>
          <Link 
            to="/jobs/posted" 
            className="flex items-center text-gray-700 hover:text-primary transition-colors py-2"
          >
            <BriefcaseBusiness size={18} className="mr-2" />
            Jobs I've Posted
          </Link>
          <Link 
            to="/jobs/create" 
            className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors mt-4"
          >
            <Plus size={18} className="mr-2" />
            Post a Job
          </Link>
        </div>
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <h1 className="text-2xl font-bold mb-4">Find Your Next Opportunity</h1>
        
        <JobSearch onSearch={handleSearch} />
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div>
            <p className="mb-4 text-gray-600">
              {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
              {searchParams.query || searchParams.location || searchParams.jobType ? ' matching your search' : ''}
            </p>
            
            {jobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BriefcaseBusiness size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
            {searchParams.query || searchParams.location || searchParams.jobType ? (
              <p className="text-gray-600 mb-4">
                We couldn't find any jobs matching your search criteria. Try adjusting your filters.
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                There are no job listings available at the moment.
              </p>
            )}
            <Link
              to="/jobs/create"
              className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus size={18} className="mr-2" />
              Post a Job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;