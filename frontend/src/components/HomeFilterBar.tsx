import { format, parseISO } from "date-fns";
import { CalendarIcon, Search, SlidersHorizontal, X } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
} from "@/components/ui/combobox";
import {
	Field,
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
import { useStates } from "@/hooks/use-announcements";
import type { StateResponse } from "@/lib/schema";
import { cn } from "@/lib/utils";

interface HomeFilterBarProps {
	searchTerm: string;
	setSearchTerm: (val: string) => void;
	category: string[];
	setCategory: (val: string[]) => void;
	startDate: string;
	endDate: string;
	setDateRange: (start: string, end: string) => void;
	stateIds: string[];
	setStateIds: (val: string[]) => void;
	clearAllFilters: () => void;
	resultCount: number;
}

export function HomeFilterBar({
	searchTerm,
	setSearchTerm,
	category,
	setCategory,
	startDate,
	endDate,
	setDateRange,
	stateIds,
	setStateIds,
	clearAllFilters,
	resultCount,
}: HomeFilterBarProps) {
	const { data: allStates } = useStates();
	const stateAnchorRef = React.useRef<HTMLDivElement | null>(null);

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

	const selectedStates = React.useMemo(() => {
		if (!allStates) return [];
		return allStates.filter((s: StateResponse) =>
			stateIds.includes(s.state_id),
		);
	}, [allStates, stateIds]);

	const hasFilters =
		category.length > 0 || startDate || endDate || stateIds.length > 0;

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
								{hasFilters && (
									<span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
										{category.length +
											(startDate || endDate ? 1 : 0) +
											stateIds.length}
									</span>
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-sm">
							<div className="flex flex-col gap-4">
								<FieldSet>
									<FieldLegend variant="label">Program Type</FieldLegend>
									<FieldGroup className="gap-3 flex-row flex-wrap">
										{[
											"Undergraduate",
											"Postgraduate",
											"Professional",
											"Diploma",
											"Doctorate",
										].map((name) => (
											<Field
												key={name}
												className="w-fit"
												orientation="horizontal"
											>
												<Checkbox
													checked={category.includes(name)}
													onCheckedChange={(e: boolean) =>
														handleCategoryChange(name, e)
													}
													id={`home-${name.toLowerCase()}`}
													name={name.toLowerCase()}
												/>
												<FieldLabel
													htmlFor={`home-${name.toLowerCase()}`}
													className="font-normal"
												>
													{name}
												</FieldLabel>
											</Field>
										))}
									</FieldGroup>
								</FieldSet>
								<Field>
									<FieldLabel>Deadline Range</FieldLabel>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal h-10 group/date-picker"
											>
												<CalendarIcon
													className={cn(
														"mr-2 size-4",
														!startDate &&
															!endDate &&
															"text-muted-foreground group-hover/date-picker:text-primary-foreground",
													)}
												/>
												{startDate || endDate ? (
													<span>
														{startDate || "Start"} — {endDate || "End"}
													</span>
												) : (
													<span className="text-muted-foreground group-hover/date-picker:text-primary-foreground">
														Pick a date range
													</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<Calendar
												mode="range"
												selected={selectedRange}
												onSelect={handleRangeSelect}
												numberOfMonths={1}
											/>
										</PopoverContent>
									</Popover>
								</Field>

								<Field>
									<FieldLabel>State</FieldLabel>
									<Combobox
										multiple
										items={allStates ?? []}
										value={selectedStates}
										onValueChange={(values: StateResponse[]) => {
											setStateIds(values.map((s: StateResponse) => s.state_id));
										}}
									>
										<ComboboxChips ref={stateAnchorRef}>
											<ComboboxValue>
												{(values: StateResponse[]) => (
													<>
														{values.map((state: StateResponse) => (
															<ComboboxChip
																key={state.state_id}
																aria-label={state.name}
															>
																{state.name}
															</ComboboxChip>
														))}
														<ComboboxChipsInput
															placeholder={
																values.length > 0 ? "" : "Search states..."
															}
														/>
													</>
												)}
											</ComboboxValue>
										</ComboboxChips>
										<ComboboxContent anchor={stateAnchorRef}>
											<ComboboxList>
												{(state: StateResponse) => (
													<ComboboxItem key={state.state_id} value={state}>
														{state.name}
													</ComboboxItem>
												)}
											</ComboboxList>
											<ComboboxEmpty>No states found</ComboboxEmpty>
										</ComboboxContent>
									</Combobox>
								</Field>
								<div className="flex items-center justify-between">
									<Button variant="ghost" size="sm" onClick={clearAllFilters}>
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
