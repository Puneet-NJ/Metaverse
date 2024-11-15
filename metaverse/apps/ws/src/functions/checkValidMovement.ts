import { SPACES } from "../global";
import checkValidPosi from "./checkValidPosi";

const checkValidMovement = (
	spaceId: string,
	userId: string,
	x: number,
	y: number
) => {
	// checking if the user goes beyond the wall
	if (x > SPACES.get(spaceId)!.width - 1) return false;
	if (y > SPACES.get(spaceId)!.height - 1) return false;

	// checking for valid movement i.e. not >1 step
	const prevX = SPACES.get(spaceId)!.users.get(userId)!.x;
	const prevY = SPACES.get(spaceId)!.users.get(userId)!.y;

	if (Math.abs(x - prevX) >= 2 || Math.abs(y - prevY) >= 2) return false;
	if (Math.abs(x - prevX) > 0 && Math.abs(y - prevY) > 0) return false;

	// checking for valid posi
	return checkValidPosi(spaceId, x, y);
};

export default checkValidMovement;
