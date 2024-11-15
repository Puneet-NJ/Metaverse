import zod from "zod";

export const signupSchema = zod.object({
	username: zod.string(),
	password: zod.string(),
	role: zod.enum(["Admin", "User"]),
});

export const signinSchema = zod.object({
	username: zod.string(),
	password: zod.string(),
});

export const updataMetadataSchema = zod.object({
	avatarId: zod.string(),
});

export const createSpaceSchema = zod
	.object({
		name: zod.string(),
		dimensions: zod.string().optional(),
		mapId: zod.string().optional(),
	})
	.refine((data) => data.dimensions || data.mapId, {
		message: "Either dimensions or mapId must be provided.",
		path: ["dimensions", "mapId"], // Specify the fields related to the validation error
	});

export const addElementSchema = zod.object({
	elementId: zod.string(),
	spaceId: zod.string(),
	x: zod.number(),
	y: zod.number(),
});

export const deleteElementSchema = zod.object({
	id: zod.string(),
});

export const createElementSchema = zod.object({
	imageUrl: zod.string(),
	width: zod.number(),
	height: zod.number(),
	static: zod.boolean(),
});

export const updateElementSchema = zod.object({
	imageUrl: zod.string(),
});

export const createAvatarSchema = zod.object({
	imageUrl: zod.string(),
	name: zod.string(),
});

export const createMapSchema = zod.object({
	thumbnail: zod.string(),
	dimensions: zod.string(),
	name: zod.string(),
	defaultElements: zod.array(
		zod.object({ elementId: zod.string(), x: zod.number(), y: zod.number() })
	),
});
