import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			res.status(403).json({ msg: "Token not found" });
			return;
		}

		try {
			const decodedToken = jwt.verify(
				token,
				process.env.JWT_SECRET || "mysecretpassword"
			) as { role: "Admin" | "User"; id: string };

			if (decodedToken.role !== "Admin") {
				res.status(403).json({ msg: "You are unauthorized" });
				return;
			}

			res.set("adminId", decodedToken.id);

			next();
		} catch (err) {
			res.status(403).json({ msg: "Invalid token" });
			return;
		}
	} catch (err) {
		res.status(500).json({ msg: "Internal server error" });
	}
};

export default adminAuth;
