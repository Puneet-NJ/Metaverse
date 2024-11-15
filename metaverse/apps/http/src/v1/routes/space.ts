import { response, Router } from "express";
import {
	addElementSchema,
	createSpaceSchema,
	deleteElementSchema,
} from "../../types";
import userAuth from "../../middleware/user";
import client from "@repo/db/client";

export const spaceRouter = Router();

spaceRouter.post("/", userAuth, async (req, res) => {
	const validateInput = createSpaceSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	const mapId = validateInput.data.mapId;
	let dimensions = validateInput.data.dimensions?.split("x");
	const name = validateInput.data.name;
	const userId = res.get("userId");

	if (!mapId) {
		const height = parseInt((dimensions as string[])[0]);
		const width = parseInt((dimensions as string[])[1]);

		const response = await client.space.create({
			data: {
				width,
				height,
				name,
				creatorId: userId!,
				thumbnail: "",
			},
		});

		res.json({ spaceId: response.id });
		return;
	}

	const mapDetails = await client.map.findFirst({
		where: { id: mapId },

		select: {
			width: true,
			height: true,
			mapElements: true,
		},
	});

	if (!mapDetails) {
		res.status(400).json({ msg: "Invalid map id" });
		return;
	}

	const spaceId = await client.$transaction(async () => {
		const space = await client.space.create({
			data: {
				height: mapDetails.height,
				width: mapDetails.width,
				name,
				creatorId: userId!,
			},
		});

		await client.spaceElements.createMany({
			data: mapDetails.mapElements.map((e) => ({
				x: e.x,
				y: e.y,
				elementId: e.elementId,
				spaceId: space.id,
			})),
		});

		return space.id;
	});

	res.json({ spaceId });
});

spaceRouter.get("/all", userAuth, async (req, res) => {
	const userId = res.get("userId");

	const response = await client.space.findMany({
		where: {},
	});

	res.json({
		spaces: response.map((r) => ({
			id: r.id,
			name: r.name,
			dimensions: `${r.height}x${r.width}`,
			thumbnail: r.thumbnail,
		})),
	});
});

spaceRouter.get("/:spaceId", userAuth, async (req, res) => {
	const spaceId = req.params.spaceId;

	const response = await client.space.findFirst({
		where: { id: spaceId },
		select: {
			width: true,
			height: true,
			spaceElements: {
				select: {
					id: true,
					x: true,
					y: true,

					element: true,
				},
			},
		},
	});

	if (!response) {
		res.status(400).json({ msg: "Invalid space Id" });
		return;
	}

	res.json({
		dimensions: `${response.height}x${response.width}`,
		elements: response.spaceElements.map((e) => ({
			id: e.id,
			x: e.x,
			y: e.y,
			element: e.element,
		})),
	});
});

spaceRouter.post("/element", userAuth, async (req, res) => {
	const validateInput = addElementSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	const elementId = validateInput.data.elementId;
	const spaceId = validateInput.data.spaceId;
	const x = validateInput.data.x;
	const y = validateInput.data.y;

	const userId = res.get("userId");

	const space = await client.space.findFirst({
		where: { id: spaceId },
	});
	if (!space) {
		res.status(400).json({ msg: "Invalid space" });
		return;
	}

	if (userId !== space.creatorId) {
		res.status(403).json({ msg: "You are unauthorized" });
		return;
	}

	if (space.width < x || space.height < y) {
		res
			.status(400)
			.json({ msg: "The location point falls beyond space's dimension" });
		return;
	}
	await client.spaceElements.create({
		data: {
			elementId,
			spaceId,
			x,
			y,
		},
	});

	res.json({ msg: "Created space element" });
});

spaceRouter.delete("/element", userAuth, async (req, res) => {
	const validateInput = deleteElementSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}
	const id = validateInput.data.id;
	const userId = res.get("userId");

	const space = await client.spaceElements.findFirst({
		where: { id },
		select: { space: { select: { creatorId: true } } },
	});
	if (!space) {
		res.status(400).json({ msg: "Invalid space element id" });
		return;
	}

	if (space.space.creatorId !== userId) {
		res.status(403).json({ msg: "You are unauthorized" });
		return;
	}

	await client.spaceElements.delete({
		where: { id },
	});

	res.json({ msg: "Element deleted" });
});

spaceRouter.delete("/:spaceId", userAuth, async (req, res) => {
	const spaceId = req.params.spaceId;
	const userId = res.get("userId");

	const space = await client.space.findFirst({
		where: {
			id: spaceId,
		},
	});
	if (!space) {
		res.status(400).json({ msg: "This space doesn't exists" });
		return;
	}
	if (space.creatorId !== userId) {
		res.status(403).json({ msg: "This space wasn't created by you" });
		return;
	}

	await client.space.delete({
		where: { id: spaceId },
	});

	res.json({ msg: "Space deleted" });
});
