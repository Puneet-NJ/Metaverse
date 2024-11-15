import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

const userAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(403).json({ msg: "Unauthorized" });
			return;
		}

		try {
			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET || "mysecretpassword"
			) as { role: "User" | "Admin"; id: string };

			res.set("userId", decodedToken.id);

			next();
		} catch (err) {
			res.status(403).json({ msg: "Invalid token" });
			return;
		}
	} catch (err) {
		res.status(403).json({ msg: "Invalid token" });
	}
};

export default userAuth;
