const lib = require("./utils/lib.js");

const dataPath = "data/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {typeof import("express").Request} req
 * @param {typeof import("express").Response} res
 * @returns 
 */
function login(server, req, res)
{
	let client = new lib.types.Client(server, req, "./html/login.html");

	for (let [id, user] of server.userMap)
	{
		if (user.Name == client.dataName)
		{
			if (lib.crypt.compareSync(client.body, user.Password) == false)
				res.status(401).end("Wrong password nigga");
			client.isAdmin = user.isAdmin;
			addUser(server, client, res, user);
			return (res.redirect("/"));
		}
	}
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

module.exports = {login};
