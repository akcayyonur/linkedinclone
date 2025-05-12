import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const JobSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, location, jobType });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row gap-2 md:gap-4">
          <div className="flex-grow">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search job titles, companies, or keywords"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-grow">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Location"
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <select
              className="px-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">All job types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobSearch;