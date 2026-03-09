import { CalendarX2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import { FilterBar } from "@/components/FilterBar";
import { Layout } from "@/components/Layout";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmissionDates } from "@/hooks/use-announcements";

const PAGE_SIZE = 20;

export default function Home() {
	const [searchParams, setSearchParams] = useSearchParams();
	const page = Math.max(1, Number(searchParams.get("page")) || 1);

	const setPage = useCallback(
		(newPage: number) => {
			setSearchParams((prev) => {
				const next = new URLSearchParams(prev);
				if (newPage <= 1) {
					next.delete("page");
				} else {
					next.set("page", String(newPage));
				}
				return next;
			});
			window.scrollTo({ top: 0, behavior: "instant" });
		},
		[setSearchParams],
	);

	const [searchTerm, setSearchTerm] = useState("");
	const [category, setCategory] = useState<string[]>([]);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const setCategoryAndResetPage = useCallback(
		(val: string[]) => {
			setCategory(val);
			setPage(1);
		},
		[setPage],
	);
	const setStartDateAndResetPage = useCallback(
		(val: string) => {
			setStartDate(val);
			setPage(1);
		},
		[setPage],
	);
	const setEndDateAndResetPage = useCallback(
		(val: string) => {
			setEndDate(val);
			setPage(1);
		},
		[setPage],
	);

	const { data, isLoading, error } = useAdmissionDates({
		page,
		limit: PAGE_SIZE,
		categories: category,
		startDate,
		endDate,
	});

	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / PAGE_SIZE);

	const filteredData = useMemo(() => {
		const items = data?.items ?? [];
		if (!items.length) return [];
		if (!searchTerm.trim()) return items;

		const lowerSearch = searchTerm.toLowerCase();
		return items.filter((item) => {
			const matchTitle = item.title?.toLowerCase().includes(lowerSearch);
			const matchInst = item.institution?.name
				?.toLowerCase()
				.includes(lowerSearch);
			const matchState = item.state?.name?.toLowerCase().includes(lowerSearch);
			return matchTitle || matchInst || matchState;
		});
	}, [data, searchTerm]);

	const getPageNumbers = useCallback(() => {
		const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
			return pages;
		}
		pages.push(1);
		if (page > 3) pages.push("ellipsis-start");
		const start = Math.max(2, page - 1);
		const end = Math.min(totalPages - 1, page + 1);
		for (let i = start; i <= end; i++) pages.push(i);
		if (page < totalPages - 2) pages.push("ellipsis-end");
		pages.push(totalPages);
		return pages;
	}, [page, totalPages]);

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
				setCategory={setCategoryAndResetPage}
				startDate={startDate}
				setStartDate={setStartDateAndResetPage}
				endDate={endDate}
				setEndDate={setEndDateAndResetPage}
				resultCount={searchTerm.trim() ? filteredData.length : total}
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
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{filteredData.map((announcement) => (
							<div key={announcement.announcement_id} className="h-full">
								<AnnouncementCard announcement={announcement} />
							</div>
						))}
					</div>

					{totalPages > 1 && (
						<Pagination className="mt-10">
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={(e) => {
											e.preventDefault();
											setPage(Math.max(1, page - 1));
										}}
										className={
											page <= 1
												? "pointer-events-none opacity-50"
												: "cursor-pointer"
										}
									/>
								</PaginationItem>

								{getPageNumbers().map((p) =>
									typeof p === "string" ? (
										<PaginationItem key={p}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={p}>
											<PaginationLink
												isActive={p === page}
												onClick={(e) => {
													e.preventDefault();
													setPage(p);
												}}
												className="cursor-pointer"
											>
												{p}
											</PaginationLink>
										</PaginationItem>
									),
								)}

								<PaginationItem>
									<PaginationNext
										onClick={(e) => {
											e.preventDefault();
											setPage(Math.min(totalPages, page + 1));
										}}
										className={
											page >= totalPages
												? "pointer-events-none opacity-50"
												: "cursor-pointer"
										}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					)}
				</>
			)}
		</Layout>
	);
}
