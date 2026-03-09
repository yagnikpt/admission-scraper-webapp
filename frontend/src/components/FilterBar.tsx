import { format, parseISO } from "date-fns";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface FilterBarProps {
	searchTerm: string;
	setSearchTerm: (val: string) => void;
	category: string[];
	setCategory: (val: string[]) => void;
	startDate: string;
	endDate: string;
	setDateRange: (start: string, end: string) => void;
	resultCount: number;
}

export function FilterBar({
	searchTerm,
	setSearchTerm,
	category,
	setCategory,
	startDate,
	endDate,
	setDateRange,
	resultCount,
}: FilterBarProps) {
	const selectedRange: DateRange | undefined =
		startDate || endDate
			? {
					from: startDate ? parseISO(startDate) : undefined,
					to: endDate ? parseISO(endDate) : undefined,
				}
			: undefined;

	const handleRangeSelect = (range?: DateRange) => {
		if (!range?.from) {
			setDateRange("", "");
			return;
		}
		if (!range.to) return;
		setDateRange(
			format(range.from, "yyyy-MM-dd"),
			format(range.to, "yyyy-MM-dd"),
		);
	};

	function handleCategoryChange(name: string, value: boolean) {
		if (value && !category.includes(name)) {
			setCategory([...category, name]);
		} else if (!value && category.includes(name)) {
			setCategory(category.filter((c) => c !== name));
		}
	}

	const clearFilters = () => {
		setCategory([]);
		setDateRange("", "");
	};

	return (
		<div className="bg-card has-focus-visible:ring-3 has-focus-visible:ring-ring/50 transition-[color,box-shadow] rounded-2xl p-2 border border-border/60 shadow-sm mb-8 flex flex-col gap-4">
			<div className="flex flex-col lg:flex-row items-center gap-4">
				<div className="relative flex-1 w-full">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
					<Input
						placeholder="Search by title, institution, or state..."
						className="pl-11 pr-10 py-6 text-base! w-full bg-background outline-none border-none shadow-none focus-visible:ring-0"
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
				<div className="flex items-center gap-3 w-full lg:w-auto justify-between">
					<div className="text-sm font-medium text-muted-foreground px-2 whitespace-nowrap">
						{resultCount} {resultCount === 1 ? "Result" : "Results"}
					</div>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="lg"
								className="gap-2 shrink-0 h-12 rounded-lg"
							>
								<SlidersHorizontal className="w-4 h-4" />
								Filters
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-sm">
							<div className="flex flex-col gap-4">
								<FieldSet>
									<FieldLegend variant="label">Program Type</FieldLegend>
									<FieldGroup className="gap-3 flex-row flex-wrap">
										<Field className="w-fit" orientation="horizontal">
											<Checkbox
												checked={category.includes("Undergraduate")}
												onCheckedChange={(e: boolean) =>
													handleCategoryChange("Undergraduate", e)
												}
												id="undergraduate"
												name="undergraduate"
											/>
											<FieldLabel
												htmlFor="undergraduate"
												className="font-normal"
											>
												Undergraduate
											</FieldLabel>
										</Field>
										<Field className="w-fit" orientation="horizontal">
											<Checkbox
												checked={category.includes("Postgraduate")}
												onCheckedChange={(e: boolean) =>
													handleCategoryChange("Postgraduate", e)
												}
												id="postgraduate"
												name="postgraduate"
											/>
											<FieldLabel
												htmlFor="postgraduate"
												className="font-normal"
											>
												Postgraduate
											</FieldLabel>
										</Field>
										<Field className="w-fit" orientation="horizontal">
											<Checkbox
												checked={category.includes("Professional")}
												onCheckedChange={(e: boolean) =>
													handleCategoryChange("Professional", e)
												}
												id="professional"
												name="professional"
											/>
											<FieldLabel
												htmlFor="professional"
												className="font-normal"
											>
												Professional
											</FieldLabel>
										</Field>
										<Field className="w-fit" orientation="horizontal">
											<Checkbox
												checked={category.includes("Diploma")}
												onCheckedChange={(e: boolean) =>
													handleCategoryChange("Diploma", e)
												}
												id="diploma"
												name="diploma"
											/>
											<FieldLabel htmlFor="diploma" className="font-normal">
												Diploma
											</FieldLabel>
										</Field>
										<Field className="w-fit" orientation="horizontal">
											<Checkbox
												checked={category.includes("Doctorate")}
												onCheckedChange={(e: boolean) =>
													handleCategoryChange("Doctorate", e)
												}
												id="doctorate"
												name="doctorate"
											/>
											<FieldLabel htmlFor="doctorate" className="font-normal">
												Doctorate
											</FieldLabel>
										</Field>
									</FieldGroup>
									<FieldGroup>
										<Field className="w-3xs">
											<FieldLabel htmlFor="date-picker-range">
												Deadline Range
											</FieldLabel>
											<Calendar
												mode="range"
												selected={selectedRange}
												onSelect={handleRangeSelect}
												numberOfMonths={1}
											/>
											<FieldDescription>
												{startDate || endDate
													? `${startDate || "Start"} - ${endDate || "End"}`
													: "Select a start and end date"}
											</FieldDescription>
										</Field>
									</FieldGroup>
								</FieldSet>
								<div className="flex items-center justify-between">
									<Button variant="ghost" size="sm" onClick={clearFilters}>
										Clear filters
									</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
}
