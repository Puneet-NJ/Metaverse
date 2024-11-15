type Users = Map<string, { x: number; y: number }>;

interface SpaceElement {
	id: string;
	x: number;
	y: number;
	elementId: string;
}

export interface Space {
	width: number;
	height: number;
	spaceElements: SpaceElement[];
	users: Users;
}

export interface ElementInfo {
	width: number;
	height: number;
	static: boolean;
}

export interface WSC_Info {
	spaceId: string;
	userId: string;
}
