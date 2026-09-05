import * as lib from "./utils/lib.js";
import { getHtml } from "./html.js";
import {questDataPath, dataPath} from "./utils/classes/classes.js";
import { existFile, writeFile, readFile } from "./utils/data.js";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
async function create(server, client, res=null)
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
	if (await existFile(filename) == true)
	{
		if (res == null)
			return (1);
		res.status(500);
		res.end(await getHtml("./html/error/500.html").serialize());
		return ;
	}
	console.log("creating", type, name);
	let newData = await fillTemplate(server, client, type, name, id);
	if (newData == null)
	{
		if (res == null)
			return (1);
		res.status(500);
		res.end(await getHtml("./html/error/500.html").serialize());
		return ;
	}
	console.log(newData);
	if (id == "")
		id = name;
	else
		id = `${name}_${id}`;
	server.data[type].push(id);
		server.data[type].push(id);
	if (server.expandedData[type])
	{
		server.expandedData[type].set(id, 
		{Category: "",
		filename: filename,
		Ico: "",
		Img: ""});
	}
	writeFile(filename, JSON.stringify(newData, null, 2), 'utf-8');
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
async function fillTemplate(server, client, type, name, id)
{
	let templatePath = questDataPath + "template/" + type + ".json";
	let path = dataPath + "Pokemon/" + name + ".json"; 
	let	template;
	let data;

	template = JSON.parse(await readFile(templatePath));
	template.id = id;
	template.Name = name;
	if (client.req.params.type == "trainer")
		template.User = client.req.params.user ? client.req.params.user : client.user.Name;
	if (type != "pokemon")
		return (template);
	data = JSON.parse(await readFile(path));
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

export {create, fillTemplate};
