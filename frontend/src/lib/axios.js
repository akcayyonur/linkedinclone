import axios from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:5000/api/v1" : "/api/v1",
	withCredentials: true,
});

// Axios isteklerini izleme (debugging için)
axiosInstance.interceptors.request.use(
	(config) => {
		console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`, config);
		return config;
	},
	(error) => {
		console.error("❌ Request Error:", error);
		return Promise.reject(error);
	}
);

axiosInstance.interceptors.response.use(
	(response) => {
		console.log(`✅ Response: ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
		return response;
	},
	(error) => {
		console.error("❌ Response Error:", error.response || error);
		return Promise.reject(error);
	}
);