const lib = require("./utils/lib.js");

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function create(server, client, res)
{
	let type = client.req.params.type;
	let name = client.req.params.name;
	let id = createUniqueId(server, type, name);
	name = lib.utils.dataNormalize(name);
	let path = server.data.GetPath(type);
	let filename = path + + name + ".json";
	console.log("edit: filename ->", filename);
	if (lib.fs.existsSync(filename) == true)
	{
		res.status(500);
		res.end(getHtml("./html/error/500.html").serialize());
		return ;
	}
	// let json = client.body;
	// lib.fs.writeFileSync(filename, JSON.stringify(json, null, 2), 'utf-8');
	res.status(200);
	res.send(json);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {string} type 
 * @param {string} name 
 * @return {string} id 
 */
function createUniqueId(server, type, name)
{
	let id;
	let exists;

	exists = server.data[type].find(it => it == name);
	if (exists == false)
		return ("");
	id = 0;
	exists = server.data[type].find(it => it == name);
	while (exists == true)
	{
		id++;
		exists = server.data[type].find(it => it == name);
	}
	return (id);
}

module.exports = {create};