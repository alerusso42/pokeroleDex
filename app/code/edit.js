const lib = require("./utils/lib.js");

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function edit(server, client, res)
{
	//client.dataName = client.dataName.replace("", "");
	client.dirName = client.dirName.replace("api", "");
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	console.log("edit: filename ->", filename);
	if (lib.fs.existsSync(filename) == false)
	{
		console.log("error 404");
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let json = JSON.parse(client.body);
	console.log(client.req.query)
	if (client.req.query && client.req.query.onlySome)
		overrideOriginal(filename, json);
	lib.fs.writeFileSync(filename, JSON.stringify(json, null, 2), 'utf-8');
	res.status(200);
	res.send(json);
}

/**
 * 
 * @param {string} filename 
 * @param {*} newData
 */
function overrideOriginal(filename, newData)
{
	let rawOldData = lib.fs.readFileSync(filename);
	let oldData = JSON.parse(rawOldData);

	console.log("overriding");
	for (let key in oldData)
	{
		console.log(key, newData[key], oldData[key]);
		if (newData[key] != undefined)
			continue ;
		newData[key] = oldData[key];
	}
}

module.exports = {edit};