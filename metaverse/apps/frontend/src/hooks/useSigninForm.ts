import { userState } from "@/lib/atom";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import useToken from "./useToken";

const useSigninForm = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const navigate = useNavigate();
	const setUserState = useSetRecoilState(userState);
	const { decodeToken, setToken } = useToken();

	const handleChange = (data: { username?: string; password?: string }) => {
		setFormData((prev) => ({ ...prev, ...data }));
	};

	const onSubmit = async () => {
		await axios({
			url: `${process.env.BACKEND_URL}/signin`,
			method: "POST",
			data: formData,
		}).then((res) => {
			setToken(res.data.token);
			const id = decodeToken(res.data.token);

			if (!id) throw new Error("Error while decoding token");

			setUserState({ id: id, username: formData.username });

			return navigate("/spaces");
		});
	};

	return {
		handleChange,
		onSubmit,
	};
};

export default useSigninForm;