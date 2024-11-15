import { jwtDecode } from "jwt-decode";

const useToken = () => {
	const getToken = () => {
		return localStorage.getItem("token");
	};

	const setToken = (token: string) => {
		localStorage.setItem("token", token);
	};

	const decodeToken = (token: string) => {
		try {
			const data = jwtDecode<{
				iat?: number;
				id: string;
				role: "User" | "Admin";
			}>(token);

			return data.id;
		} catch (err) {
			console.error("Token decode error:", err);
			return null;
		}
	};

	return { decodeToken, setToken, getToken };
};

export default useToken;
