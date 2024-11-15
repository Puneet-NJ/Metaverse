import { atom } from "recoil";

export const userState = atom({
	key: "userAtom",
	default: {
		id: "",
		username: "",
	},
});
