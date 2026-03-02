import { Bell, GraduationCap, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";

interface LayoutProps {
	children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
	const location = useLocation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navItems = [
		{ label: "Admission Dates", path: "/", icon: GraduationCap },
		{ label: "General Announcements", path: "/announcements", icon: Bell },
	];

	return (
		<div className="min-h-screen flex flex-col bg-background selection:bg-accent/20">
			{/* Top Navigation */}
			<header className="sticky top-0 z-50 glass-nav">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<div className="flex-shrink-0 flex items-center gap-2">
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

						{/* Desktop Navigation */}
						<nav className="hidden md:flex space-x-1">
							{navItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
												isActive
													? "bg-secondary text-foreground shadow-sm"
													: "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
											}
                    `}
									>
										<item.icon className="w-4 h-4" />
										{item.label}
									</Link>
								);
							})}
						</nav>

						{/* Mobile menu button */}
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

				{/* Mobile Navigation Dropdown */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
						<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
							{navItems.map((item) => {
								const isActive = location.pathname === item.path;
								return (
									<Link
										key={item.path}
										to={item.path}
										onClick={() => setMobileMenuOpen(false)}
										className={`
                      block px-3 py-3 rounded-lg text-base font-medium transition-colors
                      ${
												isActive
													? "bg-secondary text-foreground"
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
						</div>
					</div>
				)}
			</header>

			{/* Main Content */}
			<main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{children}
			</main>

			{/* Footer */}
			<footer className="border-t border-border/50 py-8 mt-auto">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} AdmissionsScraper. Aggregating academic
						opportunities.
					</p>
					<div className="flex items-center gap-4 text-sm text-muted-foreground">
						<a href="#" className="hover:text-foreground transition-colors">
							Privacy
						</a>
						<a href="#" className="hover:text-foreground transition-colors">
							Terms
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
