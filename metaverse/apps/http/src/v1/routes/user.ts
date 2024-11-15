import { Router } from "express";
import { updataMetadataSchema } from "../../types";
import client from "@repo/db/client";
import userAuth from "../../middleware/user";

export const userRouter = Router();

userRouter.post("/metadata", userAuth, async (req, res) => {
	try {
		const validateInput = updataMetadataSchema.safeParse(req.body);
		if (!validateInput.success) {
			res.status(403).json({ msg: "invalid inputs" });
			return;
		}

		const avatarId = validateInput.data.avatarId;
		const userId = res.get("userId");

		try {
			const response = await client.user.update({
				where: { id: userId },
				data: { avatarId },
			});

			res.json({ avatarId: response.avatarId });
		} catch (err) {
			res.status(403).json({ msg: "Invalid avatar ID" });
			return;
		}
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});

userRouter.get("/metadata/bulk", async (req, res) => {
	try {
		let ids = req.query.ids as string;

		const rawIdsArray = ids.split(", ");
		rawIdsArray[0] = rawIdsArray[0].slice(1);
		rawIdsArray[rawIdsArray.length - 1] = rawIdsArray[
			rawIdsArray.length - 1
		].slice(0, rawIdsArray[rawIdsArray.length - 1].length - 1);

		if (rawIdsArray.length === 0) {
			res.status(400).json({ msg: "Send users Id" });
			return;
		}

		const response = await client.user.findMany({
			where: { id: { in: rawIdsArray } },
			select: {
				id: true,
				avatar: {
					select: {
						imageUrl: true,
					},
				},
			},
		});

		const avatars = response.map((r: any) => {
			return {
				id: r.id,
				imageUrl: r.avatar?.imageUrl,
			};
		});

		res.json({ avatars });
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});
