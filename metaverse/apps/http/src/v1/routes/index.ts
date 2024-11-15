import { Router } from "express";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import { signinSchema, signupSchema } from "../../types";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const router = Router();

router.post("/signup", async (req, res) => {
	const validateInput = signupSchema.safeParse(req.body);

	if (!validateInput.success) {
		res.status(403).json({ msg: "Invalid inputs" });
		return;
	}

	try {
		const username = validateInput.data.username;
		const password = validateInput.data.password;
		const role = validateInput.data.role;

		const userAlreadyExists = await client.user.findFirst({
			where: { username },
		});

		if (userAlreadyExists) {
			res.status(403).json({ msg: "Username already exists" });
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		const createUser = await client.user.create({
			data: { username, password: hashedPassword, role },
		});

		const token = jwt.sign(
			{ id: createUser.id, role: createUser.role },
			(process.env.JWT_SECRET as string) || "mysecretpassword"
		);

		res.json({ id: createUser.id, token });
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});

router.post("/signin", async (req, res) => {
	const validateInput = signinSchema.safeParse(req.body);
	if (!validateInput.success) {
		res.status(403).json({ msg: "invalid inputs" });
		return;
	}

	try {
		const username = validateInput.data.username;
		const password = validateInput.data.password;

		const userExists = await client.user.findFirst({
			where: { username },
		});

		if (!userExists) {
			res.status(403).json({ msg: "Username doesn't exist" });
			return;
		}

		const compareHashPassword = await bcrypt.compare(
			password,
			userExists.password
		);
		if (!compareHashPassword) {
			res.status(403).json({ msg: "Incorrect password" });
			return;
		}

		const token = jwt.sign(
			{ id: userExists.id, role: userExists.role },
			(process.env.JWT_SECRET as string) || "mysecretpassword"
		);

		res.json({ token });
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});

router.get("/avatars", async (req, res) => {
	try {
		const response = await client.avatar.findMany({ where: {} });

		res.json({ avatars: response });
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
});

router.get("/elements", async (req, res) => {
	const elements = await client.element.findMany({ where: {} });

	res.json({ elements });
});

router.use("/space", spaceRouter);

router.use("/user", userRouter);

router.use("/admin", adminRouter);
