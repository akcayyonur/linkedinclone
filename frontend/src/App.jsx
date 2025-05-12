import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import toast, { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./lib/axios";
import NotificationsPage from "./pages/NotificationsPage";
import NetworkPage from "./pages/NetworkPage";
import PostPage from "./pages/PostPage";
import ProfilePage from "./pages/ProfilePage";

// Job pages
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import JobFormPage from "./pages/JobFormPage";
import SavedJobsPage from "./pages/SavedJobsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import PostedJobsPage from "./pages/PostedJobsPage";

function App() {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await axiosInstance.get("/auth/me");
				return res.data;
			} catch (err) {
				if (err.response && err.response.status === 401) {
					return null;
				}
				toast.error(err.response.data.message || "Something went wrong");
			}
		},
	});

	if (isLoading) return null;

	return (
		<Layout>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to={"/login"} />} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
				<Route path='/notifications' element={authUser ? <NotificationsPage /> : <Navigate to={"/login"} />} />
				<Route path='/network' element={authUser ? <NetworkPage /> : <Navigate to={"/login"} />} />
				<Route path='/post/:postId' element={authUser ? <PostPage /> : <Navigate to={"/login"} />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to={"/login"} />} />
				
				{/* Job routes */}
				<Route path='/jobs' element={authUser ? <JobsPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/:jobId' element={authUser ? <JobDetailPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/create' element={authUser ? <JobFormPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/:jobId/edit' element={authUser ? <JobFormPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/saved' element={authUser ? <SavedJobsPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/my-applications' element={authUser ? <MyApplicationsPage /> : <Navigate to={"/login"} />} />
				<Route path='/jobs/posted' element={authUser ? <PostedJobsPage /> : <Navigate to={"/login"} />} />
			</Routes>
			<Toaster />
		</Layout>
	);
}

export default App;