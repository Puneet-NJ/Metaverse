// const axios = require("axios");
const WebSocket = require("ws");

const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:8080/";

// I have created a custom axios library here bcoz axios on failed request throws an error
//instead of returning some data but i could have also done something like whenever axios throws
//an error i could have just sent back the error instead of letting axios throw an error
// i.e.
// try {
//   res = axios({...})
// 	 return res
// } catch(err) {
//   return err
//}
const axios = ({ url, method, data, headers }) => {
	return new Promise((resolve) =>
		fetch(url, {
			method,
			headers: { "Content-Type": "application/json", ...headers },
			body: JSON.stringify(data),
		})
			.then(async (data) => {
				const body = await data.json();

				resolve({
					data: body,
					status: data.status,
				});
			})
			.catch((err) => resolve(err))
	);
};

describe("Authorization", () => {
	test("Create a new user", async () => {
		try {
			const username = `puneet-${Math.random()}`;
			const password = `${Math.random()}`;

			const response = await axios({
				url: `${BACKEND_URL}/api/v1/signup`,
				method: "POST",
				data: {
					username,
					password,
					role: "Admin",
				},
			});

			expect(response.status).toBe(200);
		} catch (err) {
			console.log(err);
		}
	});

	test("Don't allow duplicate usernames", async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const res = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				password,
				role: "Admin",
			},
		});

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				password,
				role: "Admin",
			},
		});

		expect(response.status).toBe(403);
	});

	test("Signup request fails if the username is empty", async () => {
		const password = `${Math.random()}`;

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				password,
				type: "Admin",
			},
		});

		expect(response.status).toBe(403);
	});

	test("Signup request fails if the password is empty", async () => {
		const username = `puneet-${Math.random()}`;

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				type: "Admin",
			},
		});

		expect(response.status).toBe(403);
	});

	test("Signs in the user", async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const res = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				password,
				role: "Admin",
			},
		});

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: {
				username,
				password,
			},
		});

		expect(response.status).toBe(200);
		expect(response.data.token).toBeDefined();
	});

	test("Shouldn't sign in on wrong credentials", async () => {
		const username = `puneet-${Math.random()}`;
		const password = `;asjfkdafskldj`;

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: {
				username,
				password,
			},
		});

		expect(response.status).toBe(403);
	});
});

describe("update metadata", () => {
	let token = "";
	let avatarId = "";

	beforeAll(async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				password,
				role: "Admin",
			},
		});

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username, password },
		});

		const avatarResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/avatar`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
				name: "Timmy",
			},
			headers: { Authorization: `Bearer ${response.data.token}` },
		});

		avatarId = avatarResponse.data.avatarId;
		token = response.data.token;
	});

	test("shouldn't update metadata for invalid avatarId", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/user/metadata`,
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			data: { avatarId: "wrongAvatarId" },
		});

		expect(response.status).toBe(403);
	});

	test("should update metadata for valid avatarId", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/user/metadata`,
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			data: { avatarId },
		});

		expect(response.status).toBe(200);
	});

	test("should fail when authorization header is missing", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/user/metadata`,
			method: "POST",
			data: { avatarId },
		});

		expect(response.status).toBe(403);
	});
});

describe("get avatars endpoint", () => {
	let token = "";
	let avatarId = "";
	let userId = "";

	beforeAll(async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const signupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: {
				username,
				password,
				role: "Admin",
			},
		});

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username, password },
		});

		const avatarResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/avatar`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
				name: "Timmy",
			},
			headers: { Authorization: `Bearer ${response.data.token}` },
		});

		userId = signupResponse.data.id;
		avatarId = avatarResponse.data.avatarId;
		token = response.data.token;
	});

	test("check available avatars", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/avatars`,
			method: "GET",
		});

		expect(response.data.avatars.length).not.toBe(0);

		const checkAvatar = response.data.avatars.find((x) => x.id === avatarId);

		expect(checkAvatar).toBeDefined();
	});

	test("get other users metadata", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`,
			method: "GET",
		});

		expect(response.data.avatars.length).not.toBe(0);
		expect(response.data.avatars[0].id).toBe(userId);
	});
});

describe("space information", () => {
	let userId = "";
	let token = "";
	let adminId = "";
	let adminToken = "";
	let elementId = "";
	let mapId = "";

	beforeAll(async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}-pass`;

		const adminSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "admin", password, role: "Admin" },
		});
		adminId = adminSignupResponse.data.id;

		const adminSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "admin", password },
		});
		adminToken = adminSigninResponse.data.token;

		const signupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username, password, role: "User" },
		});
		userId = signupResponse.data.id;

		const signinResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username, password },
		});
		token = signinResponse.data.token;

		const elementResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		elementId = elementResponse.data.id;

		const mapResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/map`,
			method: "POST",
			data: {
				thumbnail: "https://thumbnail.com/a.png",
				dimensions: "100x200",
				name: "100 person interview room",
				defaultElements: [
					{
						elementId,
						x: 20,
						y: 20,
					},
				],
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		mapId = mapResponse.data.id;
	});

	test("create a space in a map where both dimensions and mapId is given", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
				dimensions: "100x200",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(200);
	});

	test("create a space in a map where only mapId is given", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(200);
	});

	test("create a space in a map where only dimensions is given", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
				dimensions: "100x200",
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(200);
	});

	test("create a space in a map where both dimensions and mapId is not given", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(403);
	});

	test("shouldn't delete a non-existing space", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/"wrongSpaceId"`,
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(400);
	});

	test("should delete an existing space", async () => {
		const createSpace = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
				dimensions: "100x200",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});
		const spaceId = createSpace.data.spaceId;

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/${spaceId}`,
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(200);
	});

	test("user shouldn't be able to delete someone else's space", async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}-pass`;
		const signupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username, password, role: "User" },
		});
		userId = signupResponse.data.userId;

		const signinResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username, password },
		});
		const user2Token = signinResponse.data.token;

		const createSpace = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test",
				dimensions: "100x200",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});
		const spaceId = createSpace.data.spaceId;

		const respone = await axios({
			url: `${BACKEND_URL}/api/v1/space/${spaceId}`,
			method: "DELETE",
			headers: { Authorization: `Bearer ${user2Token}` },
		});

		expect(respone.status).toBe(403);
	});

	test("get the existing spaces", async () => {
		// modifying coz other tests above are creating spaces with the same credentials
		const un = `puneet-${Math.random()}`;
		const pw = `${Math.random()}`;

		await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: un, password: pw, role: "User" },
		});

		const signinResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: un, password: pw },
		});
		token = signinResponse.data.token;

		const space1 = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test1",
				dimensions: "100x200",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		const space2 = await axios({
			url: `${BACKEND_URL}/api/v1/space`,
			method: "POST",
			data: {
				name: "Test2",
				dimensions: "100x200",
				mapId,
			},
			headers: { Authorization: `Bearer ${token}` },
		});

		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/all`,
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		const findSpace1 = response.data.spaces.find(
			(space) => space.id == space1.data.spaceId
		);
		const findSpace2 = response.data.spaces.find(
			(space) => space.id == space2.data.spaceId
		);

		expect(findSpace1).toBeDefined();
		expect(findSpace2).toBeDefined();

		expect(response.data.spaces.length).toBe(2);
		expect(response.status).toBe(200);
	});
});

describe("arena endpoints", () => {
	let userId = "";
	let token = "";
	let adminId = "";
	let adminToken = "";
	let elementId = "";
	let mapId = "";
	let spaceId = "";

	beforeAll(async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const adminSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "admin", password, role: "Admin" },
		});
		adminId = adminSignupResponse.data.userId;

		const adminSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "admin", password },
		});
		adminToken = adminSigninResponse.data.token;

		const signupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username, password, role: "User" },
		});
		userId = signupResponse.data.userId;

		const signinResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username, password },
		});
		token = signinResponse.data.token;

		const elementResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		elementId = elementResponse.data.id;

		const mapResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/map`,
			method: "POST",
			data: {
				thumbnail: "https://thumbnail.com/a.png",
				dimensions: "100x200",
				name: "100 person interview room",
				defaultElements: [
					{
						elementId,
						x: 20,
						y: 20,
					},
					{
						elementId,
						x: 21,
						y: 21,
					},
				],
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		mapId = mapResponse.data.id;

		const createSpace = await axios({
			url: `${BACKEND_URL}/api/v1/space/`,
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			data: {
				name: "Test",
				dimensions: "100x200",
				mapId,
			},
		});
		spaceId = createSpace.data.spaceId;
	});

	test("incorrect spaceId returns nothing", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/wrongSpaceId`,
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(400);
	});

	test("correct spaceId returns the space", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/${spaceId}`,
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.data.dimensions).toBe("100x200");
		expect(response.data.elements.length).toBe(2);
		expect(response.status).toBe(200);
	});

	// check
	// test("delete element is able to delete an element", async () => {
	// 	const response = await axios({
	// 		url: `${BACKEND_URL}/api/v1/space/element`,
	// 		method: "DELETE",
	// 		data: {
	// 			id: elementId,
	// 		},
	// 		headers: { Authorization: `Bearer ${adminToken}` },
	// 	});

	// 	expect(response.status).toBe(200);
	// });

	test("adds the element for correct spaceId", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/element`,
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			data: {
				elementId,
				spaceId,
				x: 50,
				y: 20,
			},
		});

		const getSpace = await axios({
			url: `${BACKEND_URL}/api/v1/space/${spaceId}`,
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.status).toBe(200);
		expect(getSpace.data.elements.length).toBe(3);
	});

	test("adding the element fails if the position falls outside the dimensions of the space", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/space/element`,
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			data: {
				elementId,
				spaceId,
				x: 500000,
				y: 200000,
			},
		});

		expect(response.status).toBe(400);
	});

	//check
	test("see all available elements", async () => {
		const response = await axios({
			url: `${BACKEND_URL}/api/v1/elements`,
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		expect(response.data.elements.length).not.toBe(0);
		expect(response.status).toBe(200);
	});
});

describe("admin/map creator endpoints", () => {
	let adminId = "";
	let adminToken = "";
	let userId = "";
	let userToken = "";

	beforeAll(async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const adminSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "admin", password, role: "Admin" },
		});
		adminId = adminSignupResponse.data.userId;

		const adminSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "admin", password },
		});
		adminToken = adminSigninResponse.data.token;

		const userSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "user", password, role: "User" },
		});
		const userId = userSignupResponse.data.userId;

		const userSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "user", password },
		});
		const userToken = userSigninResponse.data.token;
	});

	test("dont let user hit admin endpoints", async () => {
		const createElement = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			headers: { Authorization: `Bearer ${userToken}` },
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
		});

		const updateElement = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element/1`,
			method: "PUT",
			headers: { Authorization: `Bearer ${userToken}` },
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
			},
		});

		const createAvatar = await axios({
			url: `${BACKEND_URL}/api/v1/admin/avatar`,
			method: "POST",
			headers: { Authorization: `Bearer ${userToken}` },
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				name: "Timmy2",
			},
		});

		const createMap = await axios({
			url: `${BACKEND_URL}/api/v1/admin/map`,
			method: "POST",
			headers: { Authorization: `Bearer ${userToken}` },
			data: {
				thumbnail: "https://thumbnail.com/a.png",
				dimensions: "100x200",
				name: "100 person interview room",
				defaultElements: [],
			},
		});

		expect(createElement.status).toBe(403);
		expect(updateElement.status).toBe(403);
		expect(createAvatar.status).toBe(403);
		expect(createMap.status).toBe(403);
	});

	test("let admin hit admin endpoints", async () => {
		const createElement = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			headers: { Authorization: `Bearer ${adminToken}` },
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
		});

		const createAvatar = await axios({
			url: `${BACKEND_URL}/api/v1/admin/avatar`,
			method: "POST",
			headers: { Authorization: `Bearer ${adminToken}` },
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				name: "Timmy2",
			},
		});

		const createMap = await axios({
			url: `${BACKEND_URL}/api/v1/admin/map`,
			method: "POST",
			headers: { Authorization: `Bearer ${adminToken}` },
			data: {
				thumbnail: "https://thumbnail.com/a.png",
				dimensions: "100x200",
				name: "100 person interview room",
				defaultElements: [],
			},
		});

		expect(createElement.status).toBe(200);
		expect(createAvatar.status).toBe(200);
		expect(createMap.status).toBe(200);
	});

	test("admin is able to update the element", async () => {
		const createElement = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		const elementId = createElement.data.id;

		const updateElement = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element/${elementId}`,
			method: "PUT",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});

		expect(updateElement.status).toBe(200);
	});
});

describe("websocket tests", () => {
	let adminId = "";
	let adminToken;
	let userId = "";
	let userToken;
	let elementId = "";
	let mapId = "";
	let spaceId = "";

	let ws1;
	let ws2;
	let ws1Responses = [];
	let ws2Responses = [];
	let adminX;
	let adminY;
	let userX;
	let userY;

	const waitAndPopFirstResponse = async (wsResponseArr) => {
		return await new Promise((resolve) => {
			if (wsResponseArr.length > 0) {
				resolve(wsResponseArr.shift());
			} else {
				const intervalId = setInterval(() => {
					if (wsResponseArr.length > 0) {
						clearInterval(intervalId);
						resolve(wsResponseArr.shift());
					}
				}, 100);
			}
		});
	};

	const setupHTTP = async () => {
		const username = `puneet-${Math.random()}`;
		const password = `${Math.random()}`;

		const adminSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "admin", password, role: "Admin" },
		});
		adminId = adminSignupResponse.data.id;

		const adminSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "admin", password },
		});
		adminToken = adminSigninResponse.data.token;

		const userSignupResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signup`,
			method: "POST",
			data: { username: username + "user", password, role: "User" },
		});
		userId = userSignupResponse.data.id;

		const userSigninResponse = await axios({
			url: `${BACKEND_URL}/api/v1/signin`,
			method: "POST",
			data: { username: username + "user", password },
		});
		userToken = userSigninResponse.data.token;

		const elementResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/element`,
			method: "POST",
			data: {
				imageUrl:
					"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRCRca3wAR4zjPPTzeIY9rSwbbqB6bB2hVkoTXN4eerXOIkJTG1GpZ9ZqSGYafQPToWy_JTcmV5RHXsAsWQC3tKnMlH_CsibsSZ5oJtbakq&usqp=CAE",
				width: 1,
				height: 1,
				static: true,
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		elementId = elementResponse.data.id;

		const mapResponse = await axios({
			url: `${BACKEND_URL}/api/v1/admin/map`,
			method: "POST",
			data: {
				thumbnail: "https://thumbnail.com/a.png",
				dimensions: "100x200",
				name: "100 person interview room",
				defaultElements: [
					{
						elementId,
						x: 20,
						y: 20,
					},
					{
						elementId,
						x: 21,
						y: 21,
					},
				],
			},
			headers: { Authorization: `Bearer ${adminToken}` },
		});
		mapId = mapResponse.data.id;

		const createSpace = await axios({
			url: `${BACKEND_URL}/api/v1/space/`,
			method: "POST",
			headers: { Authorization: `Bearer ${userToken}` },
			data: {
				name: "Test",
				dimensions: "100x200",
				mapId,
			},
		});

		spaceId = createSpace.data.spaceId;
	};

	const setupWS = async () => {
		try {
			ws1 = new WebSocket(WS_URL);
			ws2 = new WebSocket(WS_URL);

			await new Promise((resolve) => {
				ws1.onopen = () => {
					resolve();
				};
			});

			ws1.onmessage = (event) => {
				ws1Responses.push(event.data);
			};

			await new Promise((resolve) => {
				ws2.onopen = () => {
					resolve();
				};
			});

			ws2.onmessage = (event) => {
				ws2Responses.push(event.data);
			};
		} catch (err) {
			console.log(err);
		}
	};

	beforeAll(async () => {
		await setupHTTP();

		await setupWS();
	});

	// check
	test("let 2 users join the room", async () => {
		ws1.send(
			JSON.stringify({
				type: "join",
				payload: {
					spaceId,
					token: adminToken,
				},
			})
		);
		let adminJoinedResponse = await waitAndPopFirstResponse(ws1Responses);

		ws2.send(
			JSON.stringify({
				type: "join",
				payload: {
					spaceId,
					token: userToken,
				},
			})
		);

		adminJoinedResponse = JSON.parse(adminJoinedResponse);

		expect(adminJoinedResponse.type).toBe("space-joined");
		expect(
			adminJoinedResponse.payload.spawn.x != undefined &&
				adminJoinedResponse.payload.spawn.y != undefined
		).toBe(true);
		expect(adminJoinedResponse.payload.users.length).toBe(0);

		let userJoinedResponse = await waitAndPopFirstResponse(ws2Responses);
		userJoinedResponse = JSON.parse(userJoinedResponse);

		expect(userJoinedResponse.type).toBe("space-joined");
		expect(
			userJoinedResponse.payload.spawn.x != undefined &&
				userJoinedResponse.payload.spawn.y != undefined
		).toBe(true);
		expect(userJoinedResponse.payload.users.length).toBe(1);

		let adminGetsUserJoinMsg = await waitAndPopFirstResponse(ws1Responses);
		adminGetsUserJoinMsg = JSON.parse(adminGetsUserJoinMsg);

		expect(adminGetsUserJoinMsg.type).toBe("user-join");
		expect(adminGetsUserJoinMsg.payload.userId).toBe(userId);
		expect(
			adminGetsUserJoinMsg.payload.x === userJoinedResponse.payload.spawn.x &&
				adminGetsUserJoinMsg.payload.y === userJoinedResponse.payload.spawn.y
		).toBe(true);

		adminX = adminJoinedResponse.payload.spawn.x;
		adminY = adminJoinedResponse.payload.spawn.y;

		userX = userJoinedResponse.payload.spawn.x;
		userY = userJoinedResponse.payload.spawn.y;
	});

	test("restricts the user from going out of the map's dimesions", async () => {
		ws1.send(
			JSON.stringify({
				type: "move",
				payload: {
					x: 20000000,
					y: 32000000,
				},
			})
		);

		let message1 = await waitAndPopFirstResponse(ws1Responses);
		message1 = JSON.parse(message1);

		expect(message1.type).toBe("movement-rejected");
		expect(message1.payload.x).toBe(adminX);
		expect(message1.payload.y).toBe(adminY);
	});

	test("user sholdn't be allowed to move 2 blocks", async () => {
		ws1.send(
			JSON.stringify({
				type: "move",
				payload: {
					x: adminX + 2,
					y: adminY,
				},
			})
		);

		let message = await waitAndPopFirstResponse(ws1Responses);
		message = JSON.parse(message);

		expect(message.type).toBe("movement-rejected");
		expect(message.payload.x).toBe(adminX);
		expect(message.payload.y).toBe(adminY);
	});

	test("correct movement should be broadcasted to other users in the room", async () => {
		ws1.send(
			JSON.stringify({
				type: "move",
				payload: {
					x: adminX + 1,
					y: adminY,
				},
			})
		);

		let checkMovement = await waitAndPopFirstResponse(ws2Responses);
		checkMovement = JSON.parse(checkMovement);

		expect(checkMovement.type).toBe("movement");
		expect(checkMovement.payload.x).toBe(adminX + 1);
		expect(checkMovement.payload.y).toBe(adminY);
		expect(checkMovement.payload.userId).toBe(adminId);
	});

	test("if the user leaves, the other users recieves the leave message", async () => {
		ws1.close();

		let message = await waitAndPopFirstResponse(ws2Responses);
		message = JSON.parse(message);

		expect(message.type).toBe("user-left");
		expect(message.payload.userId).toBe(adminId);
	});
});
