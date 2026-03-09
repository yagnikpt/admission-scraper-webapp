export function TopProgressBar({ show }: { show: boolean }) {
	if (!show) return null;

	return (
		<div className="fixed top-0 left-0 right-0 z-50 h-0.75">
			<div className="h-full bg-accent animate-progress-bar rounded-r-full" />
		</div>
	);
}
