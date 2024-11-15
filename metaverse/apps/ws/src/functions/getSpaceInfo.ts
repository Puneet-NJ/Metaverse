import client from "@repo/db/client";

const getSpaceInfo = async (spaceId: string) => {
	try {
		const response = await client.space.findFirst({
			where: { id: spaceId },
			select: {
				width: true,
				height: true,
				spaceElements: {
					select: {
						id: true,
						x: true,
						y: true,
						elementId: true,
						element: {
							select: {
								width: true,
								height: true,
								static: true,
							},
						},
					},
				},
			},
		});

		return response;
	} catch (err) {
		return null;
	}
};

export default getSpaceInfo;
