import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { X, Plus, Loader } from "lucide-react";
import Sidebar from "../components/Sidebar";
import toast from "react-hot-toast";

const JobFormPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = !!jobId;
  
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    requirements: [],
    salary: "",
    jobType: "Full-time"
  });
  
  const [requirementInput, setRequirementInput] = useState("");
  
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  
  const { data: jobData, isLoading: isJobLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/jobs/${jobId}`);
      return res.data;
    },
    enabled: isEditMode,
    onSuccess: (data) => {
      if (data) {
        setFormData({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          description: data.description || "",
          requirements: data.requirements || [],
          salary: data.salary || "",
          jobType: data.jobType || "Full-time"
        });
      }
    }
  });
  
  const { mutate: createJob, isPending: isCreating } = useMutation({
    mutationFn: (data) => axiosInstance.post("/jobs/create", data),
    onSuccess: () => {
      toast.success("Job posted successfully");
      navigate("/jobs/posted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create job");
    }
  });
  
  const { mutate: updateJob, isPending: isUpdating } = useMutation({
    mutationFn: (data) => axiosInstance.put(`/jobs/${jobId}`, data),
    onSuccess: () => {
      toast.success("Job updated successfully");
      navigate(`/jobs/${jobId}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, requirementInput.trim()]
      }));
      setRequirementInput("");
    }
  };
  
  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.company || !formData.location || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (isEditMode) {
      updateJob(formData);
    } else {
      createJob(formData);
    }
  };
  
  if (isEditMode && isJobLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }
  
  // Check if user is authorized to edit this job
  if (isEditMode && jobData && jobData.postedBy?._id !== authUser?._id) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-bold mb-2">Unauthorized</h2>
        <p>You are not authorized to edit this job posting.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      
      <div className="col-span-1 lg:col-span-3">
        <h1 className="text-2xl font-bold mb-6">
          {isEditMode ? "Edit Job Posting" : "Post a New Job"}
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Senior Software Engineer"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., Acme Corporation"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., New York, NY or Remote"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Job Type
              </label>
              <select
                name="jobType"
                value={formData.jobType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Salary (Optional)
              </label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., $80,000 - $100,000 per year"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                rows={6}
                placeholder="Provide a detailed description of the role, responsibilities, and expectations."
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Requirements
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 3+ years of experience with React"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddRequirement();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  className="bg-primary text-white p-2 rounded-r hover:bg-primary-dark transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requirements.map((req, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-100 px-3 py-1 rounded-full"
                  >
                    <span className="mr-2">{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center"
                disabled={isCreating || isUpdating}
              >
                {(isCreating || isUpdating) && (
                  <Loader size={18} className="animate-spin mr-2" />
                )}
                {isEditMode ? "Update Job" : "Post Job"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobFormPage;