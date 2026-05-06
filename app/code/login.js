const { getHtml } = require("./html.js");
const lib = require("./utils/lib.js");
const {json} = lib.utils;
const {create} = require("./create.js");
const {} = require("./utils/types.js");

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
function login(server, req, res, loginBool)
{
	let client = new lib.types.Client(server, req, "./html/login.html");

	for (let [id, user] of server.userMap)
	{
		if (user.Name == client.dataName)
		{
			if (loginBool == false)
				return (res.status(403).end("Esiste gia"));
			if (lib.crypt.compareSync(client.body, user.Password) == false)
				return (res.status(401).end("Wrong password nigga"));
			client.isAdmin = user.isAdmin;
			addUser(server, client, res, user);
			return (res.redirect("/"));
		}
	}
	if (loginBool == true)
		return (res.status(404).end("Not found"));
	if (addUser(server, client, res) == 1)
	{
		res.status(500).end("Impossibile creare il primo allenatore.");
		return ;
	}
	res.redirect("/user/" + client.dataName);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client
 * @param {import("express").Response} res
 * @param {lib.types.User} user
 */
function addUser(server, client, res, user = null)
{
	server.userNum++;
	let id = server.userNum;
	/** @type {lib.types.User} */ let newUser = {};

	if (user == null)
	{
		newUser.File = dataPath + "user/" + client.dataName + ".json";
		newUser.IsAdmin = client.isAdmin;
		newUser.Name = client.dataName;
		newUser.Password = lib.crypt.hashSync(client.body, server.cryptSalt);
		if (createFirstUserTrainer(server, client, newUser.Name) == 1)
			return (1);
		newUser.Trainers = [newUser.Name];
	}
	else
		newUser = user;
	newUser.Id = id;
	server.userMap.set(id, newUser);
	server.data["user"].push(client.dataName);
	lib.fs.writeFileSync(newUser.File, JSON.stringify(newUser, null, 2), 'utf-8');
	res.setHeader("Set-Cookie", `userId=${id}; Path=/; HttpOnly; Max-Age=31536000`);
	return (0);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client
 * @param {String} user
 */
function createFirstUserTrainer(server, client, user)
{
	let	trainerJson;
	let	trainerPath;

	client.req.params = 
	{
		type: "trainer",
		name: user,
		user: user
	}
	console.log(client.req.params);
	if (create(server, client) == 1)
	{
		console.log("couldn't create user trainer :-(");
		return (1);
	}
	trainerPath = `${server.data.GetPath("trainer")}/${user}`;
	trainer = json.getJson(trainerPath);
	trainer.User = user;
	json.editJson(trainerPath, trainer);
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
function loginCheck (server, client, res, protectedPath = false)
{
	if (client.dirName == "")
	{
		res.status(400);
		res.end(getHtml("./html/error/400.html").serialize());
		return (1);
	}
	else if (client.isAdmin == true)
		client.authLevel = lib.types.enumAuth.ADMIN;
	else if (validSearch(server, client) == true)
		client.authLevel = lib.types.enumAuth.CORRECT_LOGIN;
	else if (protectedPath == true)
	{
		res.status(401);
		res.end(getHtml("./html/error/401.html").serialize());
		return (1);
	}
	else if (client.isLogged == true)
		client.authLevel = lib.types.enumAuth.LOGIN;
	else
	{
		res.status(401);
		res.end(getHtml("./html/error/401.html").serialize());
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
 */
function validSearch(server, client)
{
	let	trainerJson;

	if (!client.user || !client.user.Name)
		return (false);
	if (!client.dataName)
		return (true);
	if (client.user.Name == client.dataName)
		return (true);
	for (let trainer of client.user.Trainers)
	{
		if (trainer == client.dataName)
			return (true);
	}
	console.log("failed. searching pokemonNames:");
	for (let trainer of client.user.Trainers)
	{
		trainerJson = lib.utils.getJson(server.data.GetPath("trainer") + trainer);
		if (!trainerJson)
			throw (`INVALID TRAINER ${trainer} from ${client.user.Name}`);
		for (let pkmn of trainerJson.Pokemon)
		{
			console.log(pkmn);
			if (pkmn == client.dataName)
			{
				return (true);
			}
		}
	}
	return (false);
}

module.exports = {login, loginCheck};
