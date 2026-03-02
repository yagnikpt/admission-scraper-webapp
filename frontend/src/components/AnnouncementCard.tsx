import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { Building, Calendar, ChevronRight, MapPin } from "lucide-react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AnnouncementResponse } from "@/lib/schema";

interface AnnouncementCardProps {
	announcement: AnnouncementResponse;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
	// Determine Degree Level Label
	const programs = announcement.programs || [];
	let degreeLabel = null;
	if (programs.length === 1 && programs[0].degree_level) {
		degreeLabel = programs[0].degree_level;
	} else if (programs.length > 1) {
		degreeLabel = `${programs.length} Programs`;
	}

	// Helper to format dates safely
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
			const now = new Date();
			return isWithinInterval(deadline, {
				start: now,
				end: addDays(now, 7),
			});
		} catch {
			return false;
		}
	};

	const deadlineDate = formatDate(announcement.application_deadline);
	const isSoon = isDeadlineSoon(announcement.application_deadline);

	return (
		<div className="flex flex-col h-full bg-card rounded-2xl p-6 border border-border/60">
			{/* Header Info */}
			<div className="flex justify-between items-start mb-4 gap-4">
				<div className="flex-1">
					{announcement.institution?.name && (
						<div className="flex items-center gap-1.5 text-sm font-medium text-accent mb-2">
							<Building className="w-4 h-4" />
							<span>{announcement.institution.name}</span>
						</div>
					)}
					<h3 className="font-display text-xl font-bold text-foreground leading-tight line-clamp-2">
						{announcement.title}
					</h3>
					{announcement.content && (
						<p className="mt-2 text-sm text-muted-foreground line-clamp-3">
							{announcement.content}
						</p>
					)}
				</div>
				{degreeLabel && (
					<Badge
						variant="secondary"
						className="whitespace-nowrap font-medium px-2.5 py-1"
					>
						{degreeLabel}
					</Badge>
				)}
			</div>

			{/* Meta details */}
			<div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-5 text-sm text-muted-foreground">
				{announcement.state && (
					<div className="flex items-center gap-1.5">
						<MapPin className="w-4 h-4" />
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

			{/* Spacer to push button to bottom */}
			<div className="grow" />

			{/* Actions */}
			<div className="pt-4 border-t border-border/40 mt-auto">
				<Link to={`/announcements/${announcement.announcement_id}`}>
					<Button className="w-full group" variant="default">
						View Details
						<ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
