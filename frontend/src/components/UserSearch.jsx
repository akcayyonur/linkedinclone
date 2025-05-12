import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Search, X, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const UserSearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null); // Hata durumunu takip etmek için
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sonuçlar dışında bir yere tıklandığında sonuç panelini kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Arama işlemi için useMutation kullanımı
  const { mutate: searchUsers } = useMutation({
    mutationFn: async (searchQuery) => {
      setIsLoading(true);
      setError(null); // Her aramada hata durumunu sıfırla
      console.log("Searching for:", searchQuery);
      try {
        const response = await axiosInstance.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
        console.log("Search results:", response.data);
        return response.data;
      } catch (err) {
        console.error("Search error:", err.response || err);
        setError(err.response?.data?.message || "Arama sırasında bir hata oluştu");
        throw err;
      }
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setShowResults(true);
      setIsLoading(false);
    },
    onError: (err) => {
      console.error("Search error in onError:", err);
      setSearchResults([]);
      setIsLoading(false);
    },
  });

  // Input değiştiğinde arama yapma
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length >= 2) {
      searchUsers(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Aramayı temizleme
  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  };

  // Enter'a basıldığında ve sonuçlar varsa ilk sonuca gitme
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      navigate(`/profile/${searchResults[0].username}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2 border rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Kullanıcıları ara..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={clearSearch}
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Arama sonuçları dropdown */}
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">
              <p>{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <ul>
              {searchResults.map((user) => (
                <li key={user._id} className="border-b last:border-b-0">
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center p-3 hover:bg-gray-50"
                    onClick={() => setShowResults(false)}
                  >
                    <img
                      src={user.profilePicture || "/avatar.png"}
                      alt={user.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.headline}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              <UserIcon size={24} className="mx-auto mb-2 text-gray-400" />
              <p>Kullanıcı bulunamadı</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch;