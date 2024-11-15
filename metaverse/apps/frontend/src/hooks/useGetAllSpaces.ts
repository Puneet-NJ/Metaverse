import axios from "axios";
import { useEffect, useState } from "react";
import useToken from "./useToken";

const useGetAllSpaces = () => {
	const [spaces, setSpaces] = useState([]);
	const [loading, setLoading] = useState(true);
	const { getToken } = useToken();

	useEffect(() => {
		axios({
			method: "GET",
			url: `${process.env.BACKEND_URL}/space/all`,
			headers: { Authorization: `Bearer ${getToken()}` },
		}).then((res) => {
			setSpaces(res.data.spaces);
			setLoading(false);
		});
	}, []);

	return {
		spaces,
		loading,
	};
};

export default useGetAllSpaces;
