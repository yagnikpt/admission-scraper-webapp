import { FileX2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar } from "@/components/FilterBar";
import { GeneralAnnouncementCard } from "@/components/GeneralAnnouncementCard";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncements } from "@/hooks/use-announcements";

export default function GeneralAnnouncements() {
	const { data: announcements, isLoading, error } = useAnnouncements();
	const [searchTerm, setSearchTerm] = useState("");

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
			<div className="mb-8 md:mb-12 text-center md:text-left">
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
					General Announcements
				</h1>
				<p className="text-lg text-muted-foreground max-w-2xl">
					Browse through all academic announcements, program updates, and
					institutional news.
				</p>
			</div>

			<FilterBar
				searchTerm={searchTerm}
				setSearchTerm={setSearchTerm}
				resultCount={filteredData.length}
			/>

			{error ? (
				<div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center">
					<p className="text-destructive font-medium">
						Failed to load announcements. Please try again later.
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
					<FileX2 className="w-16 h-16 text-muted-foreground/30 mb-4" />
					<h3 className="text-xl font-bold mb-2">No announcements found</h3>
					<p className="text-muted-foreground max-w-sm">
						We couldn't find any general announcements matching "{searchTerm}".
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{filteredData.map((announcement) => (
						<div key={announcement.announcement_id} className="h-full">
							<GeneralAnnouncementCard announcement={announcement} />
						</div>
					))}
				</div>
			)}
		</Layout>
	);
}
