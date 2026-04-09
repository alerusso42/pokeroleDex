const lib = require("./utils/lib.js");

/** @typedef {typeof import("../data/template/user.json")} User */

const dataPath = "data/questData/";

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
	addUser(server, client, res);
	res.redirect("/");
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
		newUser.File = dataPath + "users/" + client.dataName + ".json";
		newUser.IsAdmin = client.isAdmin;
		newUser.Name = client.dataName;
		newUser.Password = lib.crypt.hashSync(client.body, server.cryptSalt);
		newUser.Trainers = [];
	}
	else
		newUser = user;
	newUser.Id = id;
	server.userMap.set(id, newUser);
	lib.fs.writeFileSync(newUser.File, JSON.stringify(newUser, null, 2), 'utf-8');
	res.setHeader("Set-Cookie", `userId=${id}; Path=/; HttpOnly; Max-Age=31536000`);
}

//SECTION loginCheck function

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {bool} searchBool 
 * @returns {number} from enum enumAuth
 */
function loginCheck (server, client, searchBool = false)
{
	if (client.isAdmin == true)
		return (lib.types.enumAuth.ADMIN);
	else if (searchBool == true)
	{
		if (client.Name == client.dataName)
			return (lib.types.enumAuth.CORRECT_LOGIN);
		else
			return (lib.types.enumAuth.WRONG_LOGIN);
	}
	else if (client.isLogged == true)
		return (lib.types.enumAuth.LOGIN);
	return (lib.types.enumAuth.UNKNOWN);
}

module.exports = {login};
