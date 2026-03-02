import { z } from "zod";

export const StateResponseSchema = z.object({
	state_id: z.uuid(),
	name: z.string(),
	abbreviation: z.string(),
});
export type StateResponse = z.infer<typeof StateResponseSchema>;

export const InstitutionResponseSchema = z.object({
	institution_id: z.uuid(),
	name: z.string(),
	website: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	state_id: z.uuid().nullable().optional(),
	state: StateResponseSchema.nullable().optional(),
});
export type InstitutionResponse = z.infer<typeof InstitutionResponseSchema>;

export const ProgramResponseSchema = z.object({
	program_id: z.uuid(),
	name: z.string(),
	description: z.string().nullable().optional(),
	degree_level: z.string().nullable().optional(),
	duration_months: z.number().nullable().optional(),
});
export type ProgramResponse = z.infer<typeof ProgramResponseSchema>;

export const TagResponseSchema = z.object({
	tag_id: z.uuid(),
	name: z.string(),
});
export type TagResponse = z.infer<typeof TagResponseSchema>;

export const AnnouncementResponseSchema = z.object({
	announcement_id: z.uuid(),
	title: z.string(),
	content: z.string(),
	url: z.string(),
	institution_id: z.uuid().nullable().optional(),
	state_id: z.uuid().nullable().optional(),
	published_date: z.string().nullable().optional(),
	application_open_date: z.string().nullable().optional(),
	application_deadline: z.string().nullable().optional(),
	term: z.string().nullable().optional(),
	contact_info: z.string().nullable().optional(),
	announcement_type: z.string().nullable().optional(),
	institution: InstitutionResponseSchema.nullable().optional(),
	state: StateResponseSchema.nullable().optional(),
	programs: z.array(ProgramResponseSchema).default([]),
	tags: z.array(TagResponseSchema).default([]),
});
export type AnnouncementResponse = z.infer<typeof AnnouncementResponseSchema>;
