import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { BriefcaseBusiness, Plus, Loader, Building, MapPin, Users, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Sidebar from "../components/Sidebar";

const ApplicationStatusBadge = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <div className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-sm">
          <Clock size={14} className="mr-1" />
          <span>Pending</span>
        </div>
      );
    case 'under-review':
      return (
        <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-sm">
          <AlertCircle size={14} className="mr-1" />
          <span>Under Review</span>
        </div>
      );
    case 'accepted':
      return (
        <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
          <CheckCircle size={14} className="mr-1" />
          <span>Accepted</span>
        </div>
      );
    case 'rejected':
      return (
        <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
          <XCircle size={14} className="mr-1" />
          <span>Rejected</span>
        </div>
      );
    default:
      return null;
  }
};

const PostedJobsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: postedJobs, isLoading } = useQuery({
    queryKey: ["postedJobs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/jobs/user/posted");
      return res.data;
    }
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Job Postings</h1>
          <Link
            to="/jobs/create"
            className="flex items-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            <Plus size={18} className="mr-2" />
            Post a New Job
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : postedJobs && postedJobs.length > 0 ? (
          <div className="space-y-6">
            {postedJobs.map(job => (
              <div key={job._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between">
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
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="flex items-center text-gray-600">
                      <Users size={16} className="mr-1" />
                      <span>{job.applications?.length || 0} applicants</span>
                    </div>
                    <span className="text-sm text-gray-500 mt-1">
                      Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Link 
                      to={`/jobs/${job._id}`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/jobs/${job._id}/edit`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Edit Posting
                    </Link>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {job.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
                
                {job.applications && job.applications.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-semibold mb-3">Recent Applications</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {job.applications.map(app => (
                        <div key={app._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center">
                            <img 
                              src={app.user?.profilePicture || "/avatar.png"} 
                              alt={app.user?.name} 
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            <div>
                              <Link 
                                to={`/profile/${app.user?.username}`}
                                className="font-medium hover:underline"
                              >
                                {app.user?.name}
                              </Link>
                              <p className="text-xs text-gray-500">
                                Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                          
                          <ApplicationStatusBadge status={app.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BriefcaseBusiness size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Job Postings Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't posted any jobs yet. Create your first job posting to start receiving applications.
            </p>
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

export default PostedJobsPage;