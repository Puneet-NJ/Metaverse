import { ELEMENTS, SPACES } from "../global";

const checkValidPosi = (spaceId: string, x: number, y: number) => {
	let invalid = false;
	for (let userId of SPACES.get(spaceId)!.users) {
		if (userId[1].x === x && userId[1].y === y) return false;
	}

	SPACES.get(spaceId)!.spaceElements.some((spaceEl) => {
		const element = ELEMENTS.get(spaceEl.elementId)!;

		const elWidth = element.width;
		const elHeight = element.height;

		const elPosiX = spaceEl.x;
		const elPosiY = spaceEl.y;

		if (element.static) {
			if (x >= elPosiX && x <= elPosiX + elWidth - 1) {
				if (y >= elPosiY && y <= elPosiY + elHeight - 1) {
					invalid = true;
					return false;
				}
			}
		}
	});

	if (invalid) return false;

	return true;
};

export default checkValidPosi;
