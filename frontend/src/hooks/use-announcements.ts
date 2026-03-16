import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api, buildUrl } from "@/lib/apiRoutes";

// Log zod parse errors without crashing silently
function parseWithLogging<T extends z.ZodType>(
	schema: T,
	data: unknown,
	label: string,
): z.infer<T> {
	const result = schema.safeParse(data);
	if (!result.success) {
		console.error(
			`[Zod] ${label} validation failed:`,
			z.treeifyError(result.error),
		);
		throw new Error(`Data validation failed for ${label}`);
	}
	return result.data;
}

function buildQueryString(
	basePath: string,
	params?: Record<string, string | number | boolean | undefined>,
): string {
	const searchParams = new URLSearchParams();
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				searchParams.append(key, String(value));
			}
		}
	}
	const qs = searchParams.toString();
	return qs ? `${basePath}?${qs}` : basePath;
}

export function useAdmissionDates(params?: {
	page?: number;
	limit?: number;
	randomize?: boolean;
	categories?: string[];
	startDate?: string;
	endDate?: string;
	stateIds?: string[];
}) {
	return useQuery({
		queryKey: [api.announcements.admissionDates.path, params],
		queryFn: async () => {
			const url = buildQueryString(api.announcements.admissionDates.path, {
				page: params?.page,
				limit: params?.limit,
				randomize: params?.randomize,
				categories: params?.categories?.length
					? params.categories.join(",")
					: undefined,
				start_date: params?.startDate,
				end_date: params?.endDate,
				state_ids: params?.stateIds?.length
					? params.stateIds.join(",")
					: undefined,
			});

			const res = await fetch(url);
			if (!res.ok) throw new Error("Failed to fetch admission dates");

			const data = await res.json();
			return parseWithLogging(
				api.announcements.admissionDates.responses[200],
				data,
				"admissionDates",
			);
		},
		placeholderData: keepPreviousData,
	});
}

export function useAnnouncements(params?: {
	page?: number;
	limit?: number;
	randomize?: boolean;
	categories?: string[];
	startDate?: string;
	endDate?: string;
	stateIds?: string[];
	tagIds?: string[];
}) {
	return useQuery({
		queryKey: [api.announcements.list.path, params],
		queryFn: async () => {
			const url = buildQueryString(api.announcements.list.path, {
				page: params?.page,
				limit: params?.limit,
				randomize: params?.randomize,
				categories: params?.categories?.length
					? params.categories.join(",")
					: undefined,
				start_date: params?.startDate,
				end_date: params?.endDate,
				state_ids: params?.stateIds?.length
					? params.stateIds.join(",")
					: undefined,
				tag_ids: params?.tagIds?.length
					? params.tagIds.join(",")
					: undefined,
			});

			const res = await fetch(url);
			if (!res.ok) throw new Error("Failed to fetch announcements");

			const data = await res.json();
			return parseWithLogging(
				api.announcements.list.responses[200],
				data,
				"announcements.list",
			);
		},
		placeholderData: keepPreviousData,
	});
}

export function useAnnouncement(id: string) {
	return useQuery({
		queryKey: [api.announcements.get.path, id],
		queryFn: async () => {
			const path = buildUrl(api.announcements.get.path, { id });
			const res = await fetch(path);

			if (res.status === 404) return null;
			if (!res.ok) throw new Error("Failed to fetch announcement details");

			const data = await res.json();
			return parseWithLogging(
				api.announcements.get.responses[200],
				data,
				"announcements.get",
			);
		},
		enabled: !!id,
	});
}

export function useLastScraped() {
	return useQuery({
		queryKey: [api.meta.lastScraped.path],
		queryFn: async () => {
			const res = await fetch(api.meta.lastScraped.path);
			if (!res.ok) throw new Error("Failed to fetch last scraped date");

			const data = await res.json();
			return parseWithLogging(
				api.meta.lastScraped.responses[200],
				data,
				"meta.lastScraped",
			);
		},
	});
}

export function useStates() {
	return useQuery({
		queryKey: [api.states.list.path],
		queryFn: async () => {
			const res = await fetch(api.states.list.path);
			if (!res.ok) throw new Error("Failed to fetch states");

			const data = await res.json();
			return parseWithLogging(
				api.states.list.responses[200],
				data,
				"states.list",
			);
		},
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
}

export function useTags() {
	return useQuery({
		queryKey: [api.tags.list.path],
		queryFn: async () => {
			const res = await fetch(api.tags.list.path);
			if (!res.ok) throw new Error("Failed to fetch tags");

			const data = await res.json();
			return parseWithLogging(
				api.tags.list.responses[200],
				data,
				"tags.list",
			);
		},
		staleTime: 1000 * 60 * 30, // 30 minutes
	});
}
