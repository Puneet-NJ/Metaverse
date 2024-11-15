import jwt from "jsonwebtoken";

interface JWT_RETURNS {
	iat?: number;
	exp?: number;
	id: string;
	role: "Admin" | "User";
}

const verifyToken = (token: string) => {
	try {
		const verify = jwt.verify(
			token,
			process.env.JWT_SECRET || "mysecretpassword"
		) as JWT_RETURNS;

		return verify;
	} catch (err) {
		return null;
	}
};

export default verifyToken;
