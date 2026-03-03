import { format, parseISO } from "date-fns";
import {
	ArrowLeft,
	Building,
	Calendar,
	Clock,
	ExternalLink,
	GraduationCap,
	Link as LinkIcon,
	Mail,
	MapPin,
	Tag,
} from "lucide-react";
import { Link, useParams } from "react-router";
import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnnouncement } from "@/hooks/use-announcements";

export default function AnnouncementDetails() {
	const { id } = useParams<{ id: string }>();
	const { data: announcement, isLoading, error } = useAnnouncement(id || "");

	if (isLoading) {
		return (
			<Layout>
				<div className="max-w-4xl mx-auto py-8">
					<Skeleton className="w-24 h-10 mb-8 rounded-lg" />
					<div className="bg-card rounded-3xl p-8 border border-border">
						<Skeleton className="w-3/4 h-12 mb-6 rounded" />
						<Skeleton className="w-1/3 h-6 mb-12 rounded" />
						<div className="space-y-4">
							<Skeleton className="w-full h-4 rounded" />
							<Skeleton className="w-full h-4 rounded" />
							<Skeleton className="w-5/6 h-4 rounded" />
						</div>
					</div>
				</div>
			</Layout>
		);
	}

	if (error || !announcement) {
		return (
			<Layout>
				<div className="max-w-4xl mx-auto py-8">
					<Link to="/">
						<Button
							variant="ghost"
							className="mb-6 -ml-4 text-muted-foreground"
						>
							<ArrowLeft className="w-4 h-4 mr-2" />
							Back
						</Button>
					</Link>
					<div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-12 text-center">
						<h2 className="text-2xl font-bold text-destructive mb-2">
							Announcement Not Found
						</h2>
						<p className="text-muted-foreground">
							The requested announcement could not be found or has been removed.
						</p>
					</div>
				</div>
			</Layout>
		);
	}

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return "Not specified";
		try {
			return format(parseISO(dateString), "MMMM d, yyyy");
		} catch {
			return dateString;
		}
	};

	return (
		<Layout>
			<div className="max-w-4xl mx-auto pb-12">
				{/* Navigation back */}
				<button
					type="button"
					onClick={() => window.history.back()}
					className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-8 group"
				>
					<span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center mr-3 group-hover:bg-border transition-colors">
						<ArrowLeft className="w-4 h-4" />
					</span>
					Back to Listings
				</button>

				{/* Main Content Card */}
				<div className="bg-card rounded-3xl shadow-xl shadow-black/5 border border-border/50 overflow-hidden">
					{/* Header Header */}
					<div className="bg-linear-to-r from-primary to-primary/90 px-6 md:px-8 py-10 text-primary-foreground">
						<div className="flex flex-wrap gap-3 mb-6">
							{announcement.announcement_type && (
								<Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
									{announcement.announcement_type.toUpperCase()}
								</Badge>
							)}
							{announcement.term && (
								<Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
									{announcement.term}
								</Badge>
							)}
						</div>

						<h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-6">
							{announcement.title}
						</h1>

						<div className="flex flex-col sm:flex-row gap-6 text-primary-foreground/80 font-medium">
							{announcement.institution?.name && (
								<div className="flex items-center gap-2">
									<Building className="w-5 h-5" />
									{announcement.institution.name}
								</div>
							)}
							{announcement.state?.name && (
								<div className="flex items-center gap-2">
									<MapPin className="w-5 h-5" />
									{announcement.state.name}
								</div>
							)}
						</div>
					</div>

					{/* Body */}
					<div className="px-6 py-8 md:p-10">
						{/* Action Bar */}
						{announcement.url && (
							<div className="flex items-center justify-between p-4 bg-accent/5 border border-accent/20 rounded-2xl mb-10">
								<div className="flex items-center gap-3 text-accent font-medium text-xs md:text-base">
									<LinkIcon className="size-5" />
									<span>Official Application Portal</span>
								</div>
								<Button
									onClick={() => window.open(announcement.url, "_blank")}
									className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 rounded-lg"
								>
									Visit Website
									<ExternalLink className="size-4 ml-2" />
								</Button>
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-3 gap-10">
							{/* Main Content Column */}
							<div className="md:col-span-2 space-y-10">
								{/* Content description */}
								<section>
									<h3 className="text-xl font-bold font-display mb-4">
										About this Announcement
									</h3>
									<div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
										{announcement.content}
									</div>
								</section>

								{/* Programs List */}
								{announcement.programs && announcement.programs.length > 0 && (
									<section>
										<h3 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
											<GraduationCap className="w-5 h-5 text-accent" />
											Associated Programs
										</h3>
										<div className="grid gap-4">
											{announcement.programs.map((program) => (
												<div
													key={program.program_id}
													className="p-5 rounded-2xl bg-secondary/30 border border-border/50"
												>
													<div className="flex justify-between items-start mb-2">
														<h4 className="font-bold text-lg">
															{program.name}
														</h4>
														{program.degree_level && (
															<Badge
																variant="outline"
																className="bg-background"
															>
																{program.degree_level}
															</Badge>
														)}
													</div>
													{program.description && (
														<p className="text-sm text-muted-foreground mb-3">
															{program.description}
														</p>
													)}
													{program.duration_months && (
														<div className="text-sm font-medium text-foreground flex items-center gap-1.5">
															<Clock className="w-4 h-4 text-muted-foreground" />
															Duration: {program.duration_months} months
														</div>
													)}
												</div>
											))}
										</div>
									</section>
								)}
							</div>

							{/* Sidebar details */}
							<div className="space-y-8">
								{/* Important Dates */}
								<div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
									<h3 className="text-lg font-bold font-display mb-5 flex items-center gap-2">
										<Calendar className="w-5 h-5" />
										Important Dates
									</h3>

									<div className="space-y-5">
										<div>
											<div className="text-sm text-muted-foreground mb-1">
												Published Date
											</div>
											<div className="font-medium">
												{formatDate(announcement.published_date)}
											</div>
										</div>

										<div className="h-px w-full bg-border" />

										<div>
											<div className="text-sm text-muted-foreground mb-1">
												Application Opens
											</div>
											<div className="font-medium">
												{formatDate(announcement.application_open_date)}
											</div>
										</div>

										<div className="h-px w-full bg-border" />

										<div>
											<div className="text-sm text-muted-foreground mb-1">
												Deadline
											</div>
											<div className="font-medium text-destructive">
												{formatDate(announcement.application_deadline)}
											</div>
										</div>
									</div>
								</div>

								{/* Contact Info */}
								{announcement.contact_info && (
									<div className="bg-secondary/50 rounded-2xl p-6 border border-border/50">
										<h3 className="text-lg font-bold font-display mb-3 flex items-center gap-2">
											<Mail className="w-5 h-5" />
											Contact Info
										</h3>
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{announcement.contact_info}
										</p>
									</div>
								)}

								{/* Tags */}
								{announcement.tags && announcement.tags.length > 0 && (
									<div>
										<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
											Tags
										</h3>
										<div className="flex flex-wrap gap-2">
											{announcement.tags.map((tag) => (
												<span
													key={tag.tag_id}
													className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border text-sm font-medium"
												>
													<Tag className="w-3.5 h-3.5 text-muted-foreground" />
													{tag.name}
												</span>
											))}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
