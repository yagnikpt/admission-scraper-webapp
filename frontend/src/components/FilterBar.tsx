import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
	searchTerm: string;
	setSearchTerm: (val: string) => void;
	resultCount: number;
}

export function FilterBar({
	searchTerm,
	setSearchTerm,
	resultCount,
}: FilterBarProps) {
	return (
		<div className="bg-card rounded-2xl p-4 border border-border/60 shadow-sm mb-8 flex flex-col sm:flex-row items-center gap-4">
			<div className="relative flex-1 w-full">
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
				<Input
					placeholder="Search by title, institution, or state..."
					className="pl-11 pr-10 py-6 text-base w-full bg-background border-border focus-visible:ring-accent"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				{searchTerm && (
					<button
						type="button"
						onClick={() => setSearchTerm("")}
						className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
					>
						<X className="w-5 h-5" />
					</button>
				)}
			</div>
			<div className="flex items-center gap-3 w-full sm:w-auto">
				<div className="text-sm font-medium text-muted-foreground px-2 whitespace-nowrap">
					{resultCount} {resultCount === 1 ? "Result" : "Results"}
				</div>
				<Button
					variant="outline"
					size="lg"
					className="gap-2 shrink-0 h-12"
					onClick={() => {}}
				>
					<SlidersHorizontal className="w-4 h-4" />
					Filters
				</Button>
			</div>
		</div>
	);
}
