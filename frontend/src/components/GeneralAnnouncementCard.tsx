import { Building, ChevronRight, Tag } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import type { AnnouncementResponse } from "@/lib/schema";

interface GeneralAnnouncementCardProps {
	announcement: AnnouncementResponse;
}

export function GeneralAnnouncementCard({
	announcement,
}: GeneralAnnouncementCardProps) {
	return (
		<div className="flex flex-col h-full bg-card rounded-2xl p-6 border border-border/60">
			{/* Institute */}
			{announcement.institution?.name && (
				<div className="flex items-center gap-1.5 text-sm font-medium text-accent mb-3">
					<Building className="w-4 h-4" />
					<span>{announcement.institution.name}</span>
				</div>
			)}

			{/* Tags */}
			{announcement.tags && announcement.tags.length > 0 && (
				<div className="flex flex-wrap gap-2 mb-4">
					{announcement.tags.map((tag) => (
						<span
							key={tag.tag_id}
							className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/50 text-[10px] uppercase tracking-wider font-bold text-secondary-foreground"
						>
							<Tag className="w-2.5 h-2.5" />
							{tag.name}
						</span>
					))}
				</div>
			)}

			{/* Title */}
			<h3 className="font-display text-xl font-bold text-foreground leading-tight line-clamp-2 mb-3">
				{announcement.title}
			</h3>

			{/* Description */}
			{announcement.content && (
				<p className="text-sm text-muted-foreground line-clamp-3 mb-6">
					{announcement.content}
				</p>
			)}

			{/* Spacer */}
			<div className="grow" />

			{/* View Details */}
			<div className="pt-4 border-t border-border/40">
				<Link to={`/announcements/${announcement.announcement_id}`}>
					<Button className="w-full group" variant="outline">
						View Details
						<ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</Link>
			</div>
		</div>
	);
}
