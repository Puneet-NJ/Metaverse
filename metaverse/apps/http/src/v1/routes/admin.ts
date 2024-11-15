import { Router } from "express";
import {
	createAvatarSchema,
	createElementSchema,
	createMapSchema,
	updateElementSchema,
} from "../../types";
import client from "@repo/db/client";
import adminAuth from "../../middleware/admin";

export const adminRouter = Router();

adminRouter.post("/element", adminAuth, async (req, res) => {
	const validateInput = createElementSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	const imageUrl = validateInput.data.imageUrl;
	const width = validateInput.data.width;
	const height = validateInput.data.height;
	const isStatic = validateInput.data.static;

	const element = await client.element.create({
		data: {
			imageUrl,
			width,
			height,
			static: isStatic,
		},
	});

	res.json({ id: element.id });
});

adminRouter.put("/element/:elementId", adminAuth, async (req, res) => {
	const validateInput = updateElementSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	const elementId = req.params.elementId;
	const updateElement = await client.element.update({
		where: { id: elementId },
		data: { imageUrl: validateInput.data.imageUrl },
	});

	if (!updateElement) {
		res.status(400).json({ msg: "Invalid elementId" });
		return;
	}

	res.json({ imageUrl: updateElement.imageUrl });
});

adminRouter.post("/avatar", adminAuth, async (req, res) => {
	const validateInput = createAvatarSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	const imageUrl = validateInput.data.imageUrl;
	const name = validateInput.data.name;

	const createAvatar = await client.avatar.create({
		data: {
			imageUrl,
			name,
		},
	});

	res.json({ avatarId: createAvatar.id, msg: "Avatar created successfully" });
});

adminRouter.post("/map", adminAuth, async (req, res) => {
	try {
		const validateInput = createMapSchema.safeParse(req.body);
		if (!validateInput.success) {
			res.status(403).json({ msg: "Invalid inputs" });
			return;
		}

		const thumbnail = validateInput.data.thumbnail;
		const dimensions = validateInput.data.dimensions.split("x");
		const name = validateInput.data.name;
		const defaultElements = validateInput.data.defaultElements;

		const height = parseInt(dimensions[0]);
		const width = parseInt(dimensions[1]);

		const response = await client.map.create({
			data: {
				name,
				height,
				width,
				thumbnail,
				mapElements: {
					create: defaultElements.map((e) => ({
						x: e.x,
						y: e.y,
						elementId: e.elementId,
					})),
				},
			},
		});

		res.json({ id: response.id });
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});
