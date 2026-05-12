import { z } from "zod";
import { AnnouncementResponseSchema, LastScrapedResponseSchema, PaginatedAnnouncementResponseSchema, StateResponseSchema, TagResponseSchema } from "./schema";

export const errorSchemas = {
	validation: z.object({
		message: z.string(),
		field: z.string().optional(),
	}),
	notFound: z.object({
		message: z.string(),
	}),
	internal: z.object({
		message: z.string(),
	}),
};

export const api = {
	announcements: {
		list: {
			method: "GET" as const,
			path: "/api/announcements" as const,
			input: z
				.object({
					limit: z.number().optional(),
					page: z.number().optional(),
					randomize: z.boolean().optional(),
				})
				.optional(),
			responses: {
				200: PaginatedAnnouncementResponseSchema,
			},
		},
		admissionDates: {
			method: "GET" as const,
			path: "/api/announcements/admission-dates" as const,
			input: z
				.object({
					limit: z.number().optional(),
					page: z.number().optional(),
					randomize: z.boolean().optional(),
					has_deadline: z.boolean().optional(),
				})
				.optional(),
			responses: {
				200: PaginatedAnnouncementResponseSchema,
			},
		},
		examInfo: {
			method: "GET" as const,
			path: "/api/announcements/exam-info" as const,
			input: z
				.object({
					limit: z.number().optional(),
					page: z.number().optional(),
					randomize: z.boolean().optional(),
					has_deadline: z.boolean().optional(),
				})
				.optional(),
			responses: {
				200: PaginatedAnnouncementResponseSchema,
			},
		},
		resultInfo: {
			method: "GET" as const,
			path: "/api/announcements/result-info" as const,
			input: z
				.object({
					limit: z.number().optional(),
					page: z.number().optional(),
					randomize: z.boolean().optional(),
					has_deadline: z.boolean().optional(),
				})
				.optional(),
			responses: {
				200: PaginatedAnnouncementResponseSchema,
			},
		},
		get: {
			method: "GET" as const,
			path: "/api/announcements/:id" as const,
			responses: {
				200: AnnouncementResponseSchema,
				404: errorSchemas.notFound,
			},
		},
	},
	states: {
		list: {
			method: "GET" as const,
			path: "/api/states" as const,
			responses: {
				200: z.array(StateResponseSchema),
			},
		},
	},
	tags: {
		list: {
			method: "GET" as const,
			path: "/api/tags" as const,
			responses: {
				200: z.array(TagResponseSchema),
			},
		},
	},
	meta: {
		lastScraped: {
			method: "GET" as const,
			path: "/api/last-scraped" as const,
			responses: {
				200: LastScrapedResponseSchema,
			},
		},
	},
};

export function buildUrl(
	path: string,
	params?: Record<string, string | number>,
): string {
	let url = path;
	if (params) {
		Object.entries(params).forEach(([key, value]) => {
			if (url.includes(`:${key}`)) {
				url = url.replace(`:${key}`, String(value));
			}
		});
	}
	return url;
}
