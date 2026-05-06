const lib = require("./utils/lib.js");
const {questDataPath, dataPath} = require('./utils/classes/classes.js');

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function create(server, client, res=null)
{
	let type = client.req.params.type;
	let name = client.req.params.name;
	// let id = createUniqueId(server, type, name);
	name = lib.utils.dataNormalize(name);
	let	lastUnderscore = name.indexOf("_");
	let	id = "";
	if (lastUnderscore != -1)
	{
		name = name.slice(0, lastUnderscore);
		id = name.slice(lastUnderscore + 1);
	}
	let path = server.data.GetPath(type);
	let	filename;
	if (id != "")
		filename = path + name + "_" + id + ".json";
	else
		filename = path + name + ".json";
	console.log("edit: filename ->", filename);
	if (lib.fs.existsSync(filename) == true)
	{
		if (res == null)
			return (1);
		res.status(500);
		res.end(getHtml("./html/error/500.html").serialize());
		return ;
	}
	console.log("creating", type, name);
	let newData = fillTemplate(server, client, type, name, id);
	if (newData == null)
	{
		if (res == null)
			return (1);
		res.status(500);
		res.end(getHtml("./html/error/500.html").serialize());
		return ;
	}
	console.log(newData);
	if (id == "")
		server.data[type].push(name);
	else
		server.data[type].push(`${name}_${id}`);
	lib.fs.writeFileSync(filename, JSON.stringify(newData, null, 2), 'utf-8');
	if (res == null)
		return (0);
	res.status(200);
	res.send("");
}

/**
 * 
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client
 * @param {string} type 
 * @param {string} name
 * @param {number} id
 */
function fillTemplate(server, client, type, name, id)
{
	let templatePath = questDataPath + "template/" + type + ".json";
	let path = dataPath + "Pokemon/" + name + ".json"; 
	let	template;
	let data;

	template = JSON.parse(lib.fs.readFileSync(templatePath));
	template.id = id;
	template.Name = name;
	if (client.req.params.type == "trainer")
		template.User = client.req.params.user ? client.req.params.user : client.user.Name;
	if (type != "pokemon")
		return (template);
	data = JSON.parse(lib.fs.readFileSync(path));
	for (let key in data)
	{
		console.log(key);
		if (key in template)
			template[key] = data[key];
	}
	return (JSON.stringify(template, null, 2));
}

// /**
//  * 
//  * @param {lib.types.Server} server 
//  * @param {string} type 
//  * @param {string} name 
//  * @return {string} id 
//  */
// function createUniqueId(server, type, name)
// {
// 	let id;
// 	let exists;

// 	exists = server.data[type].find(it => it == name);
// 	if (exists == false)
// 		return ("");
// 	id = 0;
// 	exists = server.data[type].find(it => it == name);
// 	while (exists == true)
// 	{
// 		id++;
// 		exists = server.data[type].find(it => it == name);
// 	}
// 	return (id);
// }

module.exports = {create};