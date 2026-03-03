import { CalendarX2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { FilterBar } from "@/components/FilterBar";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmissionDates } from "@/hooks/use-announcements";

export default function Home() {
	const [searchTerm, setSearchTerm] = useState("");
	const [category, setCategory] = useState<string[]>([]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const {
		data: announcements,
		isLoading,
		error,
	} = useAdmissionDates({
		categories: category,
		startDate,
		endDate,
	});

	const filteredData = useMemo(() => {
		if (!announcements) return [];
		if (!searchTerm.trim()) return announcements;

		const lowerSearch = searchTerm.toLowerCase();
		return announcements.filter((item) => {
			const matchTitle = item.title?.toLowerCase().includes(lowerSearch);
			const matchInst = item.institution?.name
				?.toLowerCase()
				.includes(lowerSearch);
			const matchState = item.state?.name?.toLowerCase().includes(lowerSearch);
			return matchTitle || matchInst || matchState;
		});
	}, [announcements, searchTerm]);

	return (
		<Layout>
			<div className="mb-8 md:mb-12">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
					Latest Admission Dates
				</h1>
				<p className="md:text-lg text-muted-foreground max-w-2xl">
					Stay on top of upcoming application deadlines, term openings, and
					critical academic dates from top institutions.
				</p>
			</div>

			<FilterBar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				category={category}
				setCategory={setCategory}
				startDate={startDate}
				setStartDate={setStartDate}
				endDate={endDate}
				setEndDate={setEndDate}
				resultCount={filteredData.length}
			/>

			{error ? (
				<div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center">
					<p className="text-destructive font-medium">
						Failed to load admission dates. Please try again later.
					</p>
				</div>
			) : isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div
							key={i}
							className="bg-card rounded-2xl p-6 border border-border/60 h-75 flex flex-col"
						>
							<Skeleton className="w-1/2 h-5 mb-4 rounded" />
							<Skeleton className="w-full h-8 mb-2 rounded" />
							<Skeleton className="w-3/4 h-8 mb-6 rounded" />
							<Skeleton className="w-1/3 h-4 mb-2 rounded" />
							<Skeleton className="w-1/4 h-4 mb-auto rounded" />
							<Skeleton className="w-full h-10 mt-6 rounded-lg" />
						</div>
					))}
				</div>
			) : filteredData.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-center bg-card/50 rounded-3xl border border-border/50 border-dashed">
					<CalendarX2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
					<h3 className="text-xl font-bold mb-2">No dates found</h3>
					<p className="text-muted-foreground max-w-sm">
						We couldn't find any admission dates matching "{searchTerm}". Try
						adjusting your search.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{filteredData.map((announcement) => (
						<div key={announcement.announcement_id} className="h-full">
							<AnnouncementCard announcement={announcement} />
						</div>
					))}
				</div>
			)}
		</Layout>
	);
}
