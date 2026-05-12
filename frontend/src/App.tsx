import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AnnouncementDetails from "@/pages/AnnouncementDetails";
import GeneralAnnouncements from "@/pages/GeneralAnnouncements";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ExamInfoAnnouncements from "@/pages/ExamInfoAnnouncements";
import ResultInfoAnnouncements from "@/pages/ResultInfoAnnouncements";
import { queryClient } from "./lib/queryClient";

function Router() {
	return (
		<>
			<ScrollToTop />
			<Routes>
				<Route path="/" Component={Home} />
				<Route path="/announcements" Component={GeneralAnnouncements} />
				<Route path="/announcements/exam-info" Component={ExamInfoAnnouncements} />
				<Route path="/announcements/result-info" Component={ResultInfoAnnouncements} />
				<Route path="/announcements/:id" Component={AnnouncementDetails} />
				{/* Fallback to 404 */}
				<Route Component={NotFound} />
			</Routes>
		</>
	);
}

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<TooltipProvider>
				<Toaster />
				<Router />
			</TooltipProvider>
		</QueryClientProvider>
	);
}

export default App;
