import { getHtml } from "./html.js";
import * as lib from "./utils/lib.js";
import {create, fillTemplate} from "./create.js";
import { editJson } from "./utils/json.js";
import { writeFile } from "./utils/data.js";

const {json} = lib.utils;

/** @typedef {typeof import("../data/template/user.json")} User */

const dataPath = "../data/questData/";

//SECTION login function

/**
 * 
 * @param {lib.types.Server} server 
 * @param {typeof import("express").Request} req
 * @param {typeof import("express").Response} res
 * @param {boolean} createUserBool
 * @returns 
 */
async function login(server, req, res, loginBool)
{
	let client = new lib.types.Client(server, req, "./html/login.html");

	for (let [id, user] of server.userMap)
	{
		if (user.Name == client.dataName)
		{
			if (loginBool == false)
				return (res.status(403).end("Esiste gia"));
			if (user.Password && !client.body)
				return (res.status(401).end("Someone has forgot to put the password"));
			if (user.Password && lib.crypt.compareSync(client.body.password, user.Password) == false)
				return (res.status(401).end("Wrong password man"));
			client.isAdmin = user.isAdmin;
			addUser(server, client, res, user);
			console.log(`Welcome back, ${client.dataName}!`);
			return (res.redirect("/"));
		}
	}
	if (loginBool == true)
		return (res.status(404).end("Not found"));
	if (await addUser(server, client, res) == 1)
	{
		res.status(500).end("Impossibile creare il primo allenatore.");
		return ;
	}
	console.log(`Welcome, ${client.dataName}!`);
	res.redirect("/user/" + client.dataName);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client
 * @param {import("express").Response} res
 * @param {lib.types.User} user
 */
async function addUser(server, client, res, user = null)
{
	server.userNum++;
	let id = server.userNum;
	let idName;
	/** @type {lib.types.User} */ let newUser = {};

	if (user == null)
	{
		idName = client.dataName;
		if (server.data.user.indexOf(client.dataName) != -1)
			idName += "_" + id;
		newUser = await fillTemplate(server, client, "user", idName, id);
		newUser.File = dataPath + "user/" + client.dataName + ".json";
		newUser.IsAdmin = client.isAdmin;
		newUser.Name = client.dataName;
		if (client.body)
			newUser.Password = lib.crypt.hashSync(client.body.password, server.cryptSalt);
		else
			newUser.Password = "";
		if (await createFirstUserTrainer(server, client, newUser.Name) == 1)
			return (1);
		newUser.Trainers = [newUser.Name];
	}
	else
		newUser = user;
	newUser.Id = id;
	server.userMap.set(id, newUser);
	server.data["user"].push(client.dataName);
	server.expandedData["user"].set(client.dataName, 
	{Category: "",
	filename: "",
	Ico: "",
	Img: ""});
	writeFile(newUser.File, JSON.stringify(newUser, null, 2));
	res.setHeader("Set-Cookie", `userId=${id}; Path=/; HttpOnly; Max-Age=31536000`);
	return (0);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client
 * @param {String} user
 */
async function createFirstUserTrainer(server, client, user)
{
	let	trainerJson;
	let	trainerPath;

	client.req.params = 
	{
		type: "trainer",
		name: user,
		user: user
	}
	if (await create(server, client) == 1)
	{
		console.log("couldn't create user trainer :-(");
		return (1);
	}
	trainerPath = `${server.data.GetPath("trainer")}/${user}`;
	trainerJson = await json.getJson(trainerPath);
	trainerJson.User = user;
	json.editJson(trainerPath, trainerJson);
}

//SECTION loginCheck function

/**
 * 
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client 
 * @param {Response} res 
 * @param {bool} protectedPath
 * @returns {number} 0 on success, 1 on failure
 */
async function loginCheck (server, client, res, protectedPath = false)
{
	if (client.dirName == "")
	{
		res.status(400);
		res.end(await getHtml("./html/error/400.html").serialize());
		return (1);
	}
	else if (client.isAdmin == true)
		client.authLevel = lib.types.enumAuth.ADMIN;
	else if (await validSearch(server, client) == true)
		client.authLevel = lib.types.enumAuth.CORRECT_LOGIN;
	else if (protectedPath == true)
	{
		res.status(401);
		res.end(await getHtml("./html/error/401.html").serialize());
		return (1);
	}
	else if (client.isLogged == true)
		client.authLevel = lib.types.enumAuth.LOGIN;
	else
	{
		res.status(401);
		res.end(await getHtml("./html/error/401.html").serialize());
		return (1);
	}
	return (0);
}

/**
 * Checks if the searched data can be found it:
 * 1)	the user name;
 * 2)	the user trainers' name;
 * 3)	the user trainers's pokemon's name.
 * If nothing is searched, returns true.
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client 
 * @param {string} dataName taken from client, if missing
 */
async function validSearch(server, client, dataName=client.dataName)
{
	let	trainerJson;

	if (client.isAdmin == true)
		return (true);
	if (!client.user || !client.user.Name)
		return (false);
	if (!dataName)
		return (true);
	if (client.user.Name == dataName)
		return (true);
	for (let trainer of client.user.Trainers)
	{
		if (trainer == dataName)
			return (true);
	}
	console.log("failed. searching pokemonNames:");
	for (let trainer of client.user.Trainers)
	{
		trainerJson = await lib.utils.getJson(server.data.GetPath("trainer") + trainer);
		if (!trainerJson)
			throw (`INVALID TRAINER ${trainer} from ${client.user.Name}`);
		for (let pkmn of trainerJson.Pokemon)
		{
			console.log(pkmn);
			if (pkmn == dataName)
			{
				return (true);
			}
		}
	}
	return (false);
}

export {login, loginCheck, validSearch};
