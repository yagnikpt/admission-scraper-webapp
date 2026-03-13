import {
	addDays,
	format,
	isWithinInterval,
	parseISO,
	startOfDay,
} from "date-fns";
import { Building, Calendar, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router";
import type { AnnouncementResponse } from "@/lib/schema";
import { Badge } from "./ui/badge";

interface AnnouncementCardProps {
	announcement: AnnouncementResponse;
}

export default function AnnouncementCard({
	announcement,
}: AnnouncementCardProps) {
	const programs = announcement.programs || [];
	let degreeLabel = null;
	if (programs.length === 1 && programs[0].degree_level) {
		degreeLabel = programs[0].degree_level;
	} else if (programs.length > 1) {
		degreeLabel = `${programs.length} Programs`;
	}

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return null;
		try {
			return format(parseISO(dateString), "MMM d, yyyy");
		} catch {
			return dateString;
		}
	};

	const isDeadlineSoon = (dateString?: string | null) => {
		if (!dateString) return false;
		try {
			const deadline = parseISO(dateString);
			const today = startOfDay(new Date());
			return isWithinInterval(deadline, {
				start: today,
				end: addDays(today, 7),
			});
		} catch {
			return false;
		}
	};

	const deadlineDate = formatDate(announcement.application_deadline);
	const isSoon = isDeadlineSoon(announcement.application_deadline);

	return (
		<div className="flex h-full items-center flex-col p-1 bg-neutral-200 has-[.view-btn:hover]:bg-accent/40 transition-colors rounded-2xl">
			<div className="flex flex-col flex-1 self-start gap-2 p-4 mb-1 bg-white w-full rounded-xl">
				<div className="flex justify-between items-center gap-2 mb-2">
					{announcement.institution?.name && (
						<div className="flex items-center gap-1.5 text-sm font-semibold text-accent">
							<Building className="size-4" />
							<span className="line-clamp-1">
								{announcement.institution.name}
							</span>
						</div>
					)}
					{degreeLabel && (
						<Badge
							variant="secondary"
							className="whitespace-nowrap shrink-0 font-medium px-2.5 py-1"
						>
							{degreeLabel}
						</Badge>
					)}
				</div>
				<div>
					<h3 className="font-display text-xl text-pretty font-bold text-foreground leading-tight line-clamp-2">
						{announcement.title}
					</h3>
					{announcement.content && (
						<p className="mt-2 text-sm text-pretty text-muted-foreground line-clamp-3 mb-2">
							{announcement.content}
						</p>
					)}
				</div>
				<div className="flex-1" />
				<div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-muted-foreground">
					{announcement.state && (
						<div className="flex items-center gap-1.5">
							<MapPin className="size-4" />
							<span>{announcement.state.name}</span>
						</div>
					)}
					{deadlineDate && (
						<div
							className={`flex items-center gap-1.5 font-medium ${isSoon ? "text-destructive" : "text-muted-foreground"}`}
						>
							<Calendar className="w-4 h-4" />
							<span>Deadline: {deadlineDate}</span>
						</div>
					)}
				</div>
			</div>
			<Link
				className="flex gap-1 items-center justify-center w-full group py-2 text-sm font-medium view-btn"
				to={`/announcements/${announcement.announcement_id}`}
			>
				View Details
				<ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
			</Link>
		</div>
	);
}
