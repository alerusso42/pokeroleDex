const lib = require("./utils/lib.js");
const {questDataPath, dataPath} = require('./utils/types.js');

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
	// let id = createUniqueId(server, type, name);
	name = lib.utils.dataNormalize(name);
	let id = name.slice(name.indexOf("_") + 1);
	name = name.slice(0, name.indexOf("_"));
	let path = server.data.GetPath(type);
	let filename = path + name + "_" + id + ".json";
	console.log("edit: filename ->", filename);
	if (lib.fs.existsSync(filename) == true)
	{
		res.status(500);
		res.end(getHtml("./html/error/500.html").serialize());
		return ;
	}
	console.log("creating", type, name);
	let newData = fillTemplate(server, type, name, id);
	if (newData == null)
	{
		res.status(500);
		res.end(getHtml("./html/error/500.html").serialize());
		return ;
	}
	lib.fs.writeFileSync(filename, newData, 'utf-8');
	res.status(200);
	res.send("");
}

/**
 * 
 * @param {lib.types.Server} server
 * @param {string} type 
 * @param {string} name
 * @param {number} id
 */
function fillTemplate(server, type, name, id)
{
	let templatePath = questDataPath + "template/" + type + ".json";
	let path = dataPath + "Pokemon/" + name + ".json"; 
	let	template;
	let data;

	template = JSON.parse(lib.fs.readFileSync(templatePath));
	template.id = id;
	if (type != "pokemon")
		return (template);
	data = JSON.parse(lib.fs.readFileSync(path));
	for (let key in data)
	{
		console.log(key);
		if (key in template)
			template[key] = data[key];
	}
	console.log(template);
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