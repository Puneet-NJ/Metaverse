import { SPACES } from "../global";
import checkValidPosi from "./checkValidPosi";

const generateSpawnPosi = (spaceId: string) => {
	const spaceWidth = SPACES.get(spaceId)!.width;
	const spaceHeight = SPACES.get(spaceId)!.height;

	let posiValid = false;
	let randomX: number;
	let randomY: number;

	do {
		randomX = Math.floor(Math.random() * spaceWidth);
		randomY = Math.floor(Math.random() * spaceHeight);

		posiValid = checkValidPosi(spaceId, randomX, randomY);
	} while (!posiValid);

	return { x: randomX, y: randomY };
};

export default generateSpawnPosi;
