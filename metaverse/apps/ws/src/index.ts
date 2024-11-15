import { WebSocket, WebSocketServer } from "ws";
import verifyToken from "./tokenVerify";
import { ELEMENTS, SPACES, WSC, WSC_SPACE } from "./global";
import generateSpawnPosi from "./functions/generateSpawnPosi";
import getSpaceInfo from "./functions/getSpaceInfo";
import checkValidMovement from "./functions/checkValidMovement";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (socket) => {
	socket.on("message", async (data, isBinary) => {
		const { type, payload } = JSON.parse(data.toString());

		if (type === "join") {
			const tokenVerified = verifyToken(payload.token);
			if (!tokenVerified) {
				return socket.send(JSON.stringify({ msg: "Invalid token" }));
			}

			const spaceId = payload.spaceId;
			const userId = tokenVerified.id;
			// const userId = Math.random() + "";

			if (!SPACES.has(spaceId)) {
				const spaceInfo = await getSpaceInfo(spaceId);
				if (!spaceInfo) {
					return socket.send(JSON.stringify({ msg: "Invalid space Id" }));
				}

				const spaceElements = spaceInfo.spaceElements.map((spaceEl) => {
					// updating elements map
					if (!ELEMENTS.has(spaceEl.elementId)) {
						const element = spaceEl.element;

						ELEMENTS.set(spaceEl.elementId, {
							width: element.width,
							height: element.height,
							static: element.static,
						});
					}

					return {
						id: spaceEl.id,
						x: spaceEl.x,
						y: spaceEl.y,
						elementId: spaceEl.elementId,
					};
				});

				// updating the wsc_space map i
				WSC_SPACE.set(spaceId, []);

				// updating spaces map i
				SPACES.set(spaceId, {
					width: spaceInfo.width,
					height: spaceInfo.height,
					spaceElements,
					users: new Map<string, { x: number; y: number }>(),
				});
			}

			// updating the wsc_space map ii
			const existingWscSpace = WSC_SPACE.get(spaceId)!;
			existingWscSpace.push(socket);

			WSC_SPACE.set(spaceId, existingWscSpace);

			// updating the wsc map
			WSC.set(socket, { spaceId, userId });

			const spawnPosi = generateSpawnPosi(spaceId);

			// updating spaces map ii
			SPACES.get(spaceId)?.users.set(userId, {
				x: spawnPosi.x,
				y: spawnPosi.y,
			});

			const users: { id: string }[] = [];
			for (let user of SPACES.get(spaceId)!.users.keys()) {
				if (user !== userId) users.push({ id: user });
			}

			WSC_SPACE.get(spaceId)!.map((wsc) => {
				if (wsc !== socket) {
					wsc.send(
						JSON.stringify({
							type: "user-join",
							payload: {
								userId,
								x: spawnPosi.x,
								y: spawnPosi.y,
							},
						})
					);
				}
			});

			return socket.send(
				JSON.stringify({
					type: "space-joined",
					payload: {
						spawn: {
							x: spawnPosi.x,
							y: spawnPosi.y,
						},
						users,
					},
				})
			);
		}

		if (type === "move") {
			const wsc = WSC.get(socket);
			const x = payload.x;
			const y = payload.y;

			if (!wsc) {
				return socket.send(
					JSON.stringify({ msg: "You haven't joined the space" })
				);
			}

			const spaceId = wsc.spaceId;
			const userId = wsc.userId;

			const validMovment = checkValidMovement(spaceId, userId, x, y);

			if (!validMovment) {
				return socket.send(
					JSON.stringify({
						type: "movement-rejected",
						payload: {
							x: SPACES.get(spaceId)!.users.get(userId)!.x,
							y: SPACES.get(spaceId)!.users.get(userId)!.y,
						},
					})
				);
			}

			SPACES.get(spaceId)!.users.set(userId, { x, y });

			WSC_SPACE.get(spaceId)!.map((wsc) => {
				wsc.send(
					JSON.stringify({
						type: "movement",
						payload: {
							x: SPACES.get(spaceId)!.users.get(userId)!.x,
							y: SPACES.get(spaceId)!.users.get(userId)!.y,
							userId,
						},
					})
				);
			});

			// return socket.send(
			// 	JSON.stringify({
			// 		type: "movement",
			// 		payload: {
			// 			x: SPACES.get(spaceId)!.users.get(userId)!.x,
			// 			y: SPACES.get(spaceId)!.users.get(userId)!.y,
			// 			userId,
			// 		},
			// 	})
			// );
		}
	});

	socket.on("close", () => {
		const wsc = WSC.get(socket);

		if (!wsc) {
			socket.send(
				JSON.stringify({ msg: "You were not connected to any room" })
			);
			return;
		}

		const spaceId = wsc!.spaceId;
		const userId = wsc!.userId;

		SPACES.get(spaceId)?.users.delete(userId);

		WSC.delete(socket);

		WSC_SPACE.set(
			spaceId,
			WSC_SPACE.get(spaceId)!.filter((wsc) => socket !== wsc)
		);

		WSC_SPACE.get(spaceId)!.map((wsc) => {
			wsc.send(
				JSON.stringify({
					type: "user-left",
					payload: {
						userId,
					},
				})
			);
		});
	});
});
