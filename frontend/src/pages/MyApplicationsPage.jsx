import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";
import { Clock, CheckCircle, XCircle, AlertCircle, Building, MapPin, Loader } from "lucide-react";
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

const MyApplicationsPage = () => {
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: applications, isLoading } = useQuery({
    queryKey: ["userApplications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/jobs/user/applications");
      return res.data;
    }
  });
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <h1 className="text-2xl font-bold mb-6">My Applications</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader className="animate-spin h-8 w-8 text-primary" />
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-4">
            {applications.map((item) => (
              <div key={item.job._id} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <Link to={`/jobs/${item.job._id}`} className="text-lg font-semibold text-primary hover:underline">
                      {item.job.title}
                    </Link>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Building size={16} className="mr-1" />
                      <span className="mr-3">{item.job.company}</span>
                      <MapPin size={16} className="mr-1" />
                      <span>{item.job.location}</span>
                    </div>
                  </div>
                  
                  <ApplicationStatusBadge status={item.application.status} />
                </div>
                
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <span className="mr-2">Applied:</span>
                  <span>{formatDistanceToNow(new Date(item.application.appliedAt), { addSuffix: true })}</span>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <Link 
                    to={`/jobs/${item.job._id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View Job
                  </Link>
                  <div className="flex items-center">
                    <img 
                      src={item.job.postedBy?.profilePicture || "/avatar.png"} 
                      alt={item.job.postedBy?.name} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <Link 
                      to={`/profile/${item.job.postedBy?.username}`} 
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {item.job.postedBy?.name}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Clock size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Applications Yet</h3>
            <p className="text-gray-600 mb-4">
              You haven't applied to any jobs yet. Start exploring opportunities!
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

export default MyApplicationsPage;