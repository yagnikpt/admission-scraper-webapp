import { formatDistanceToNow } from "date-fns";
import {
	Bell,
	CircleAlert,
	Clock,
	FileCheck2,
	FileSearch,
	GraduationCap,
	Info,
	Menu,
	X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useLastScraped } from "@/hooks/use-announcements";

interface LayoutProps {
	children: React.ReactNode;
}

const NAV_ITEMS = [
	{ label: "Admission Dates", path: "/", icon: GraduationCap },
	{ label: "Exam Info", path: "/announcements/exam-info", icon: FileSearch },
	{
		label: "Result Info",
		path: "/announcements/result-info",
		icon: FileCheck2,
	},
	{ label: "General", path: "/announcements", icon: Bell },
];

export function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { data: lastScrapedData } = useLastScraped();

	const lastScrapedLabel = lastScrapedData?.last_scraped
		? formatDistanceToNow(new Date(lastScrapedData.last_scraped), {
				addSuffix: true,
			})
		: null;

	const isItemActive = (path: string) => {
		if (path === "/") return location.pathname === "/";
		if (path === "/announcements") {
			return (
				location.pathname === "/announcements" ||
				/^\/announcements\/[0-9a-fA-F-]{36}$/.test(location.pathname)
			);
		}
		return location.pathname === path;
	};

	return (
		<div className="min-h-screen flex flex-col selection:bg-accent/20">
			<header className="sticky top-0 z-50 glass-nav">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="shrink-0 flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
								<GraduationCap className="w-5 h-5 text-primary-foreground" />
							</div>
							<Link
								to="/"
								className="font-display font-bold text-xl tracking-tight text-foreground hover:opacity-80 transition-opacity"
							>
								Admissions<span className="text-accent">Scraper</span>
							</Link>
						</div>

						<nav className="hidden md:flex items-center space-x-1">
							{NAV_ITEMS.map((item) => {
								const isActive = isItemActive(item.path);
								return (
									<Link
										key={item.path}
										to={item.path}
										className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
												isActive
													? "bg-primary/5 text-foreground"
													: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
											}
                    `}
									>
										<item.icon className="w-4 h-4" />
										{item.label}
									</Link>
								);
							})}

							<Popover>
								<PopoverTrigger asChild>
									<Button variant="ghost" size="icon" aria-label="Open notices">
										<Info className="w-4 h-4" />
									</Button>
								</PopoverTrigger>
								<PopoverContent align="end" className="w-80 space-y-3">
									<div>
										<p className="text-sm font-semibold">Status & Notices</p>
										<p className="text-xs text-muted-foreground mt-1">
											Additional operational info for this scraper.
										</p>
									</div>
									<div className="rounded-lg border border-border/60 p-3 text-sm space-y-2">
										<div className="flex items-center gap-2 text-muted-foreground">
											<Clock className="w-4 h-4" />
											<span>
												Last scraped {lastScrapedLabel ?? "not available"}.
											</span>
										</div>
										<div className="flex items-start gap-2 text-muted-foreground">
											<CircleAlert className="w-4 h-4 shrink-0" />
											<span>
												The data is only scraped for Gujarat state right now.
											</span>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</nav>

						<div className="md:hidden flex items-center">
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="text-foreground"
							>
								{mobileMenuOpen ? (
									<X className="w-6 h-6" />
								) : (
									<Menu className="w-6 h-6" />
								)}
							</Button>
						</div>
					</div>
				</div>

				{mobileMenuOpen && (
					<div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
						<div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
							{NAV_ITEMS.map((item) => {
								const isActive = isItemActive(item.path);
								return (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setMobileMenuOpen(false)}
										className={`
                      block px-3 py-3 rounded-lg text-base font-medium transition-colors
                      ${
												isActive
													? "bg-primary/10 text-foreground"
													: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
											}
                    `}
									>
										<div className="flex items-center gap-3">
											<item.icon className="w-5 h-5" />
											{item.label}
										</div>
									</Link>
								);
							})}
							<div className="px-3 py-2 flex items-start gap-2 text-xs text-muted-foreground">
								<Clock className="w-3 h-3 mt-0.5" />
								<div>
									<div>Last scraped {lastScrapedLabel ?? "not available"}.</div>
									<div className="mt-1">
										The data is only scraped for Gujarat state right now.
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</header>

			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>
		</div>
	);
}
