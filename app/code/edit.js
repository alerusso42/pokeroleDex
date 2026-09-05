//@ts-check

import * as lib from "./utils/lib.js";
import { rmFile, createFile, writeFile, readFile } from "./utils/data.js";
import { getHtml } from "./html.js";

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
async function edit(server, client, res)
{
	let	id;
	let	img;
	let	ico;
	let	data;

	//client.dataName = client.dataName.replace("", "");
	client.dirName = client.dirName.replace("api", "");
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	// let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	let filename = server.data.GetFilename(client.dataName, client.dirName);
	// let json = JSON.parse(client.body);
	let json = client.body;
	console.log(client.req.query);
	if (client.req.query?.onlySome)
		overrideOriginal(filename, json);
	data = server.expandedData.GetData(client.dataName, client.dirName);
	if (json.Name && json.Name != client.dataName)
	{
		server.data[client.dirName].splice(server.data[client.dirName].indexOf(client.dataName), 1);
		server.data[client.dirName].push(json.Name);
		id = server.expandedData.SetId(client.dataName, client.dirName, json.Name);
		json.id = id;
	}
	else
		id = data.Id;
	img = data.Img;
	ico = data.Ico;
	if (img)
		json.Img = img.slice(img.lastIndexOf("."), img.length);
	if (ico)
		json.Ico = ico.slice(ico.lastIndexOf("."), ico.length);
	if (id != client.dataName)
	{
		await rmFile(filename);
		filename = server.data.GetFilename(id, client.dirName, questDataPath, "json", false);
		await createFile(filename);
	}
	if (json.Password)
		json.Password = lib.crypt.hashSync(json.Password, server.cryptSalt);
	writeFile(filename, JSON.stringify(json, null, 2));
	// json.Img = server.expandedData.GetImg(id, client.dirName);
	// json.Ico = server.expandedData.GetIco(id, client.dirName);
	for (const [k, v] of Object.entries(data))
	{
		if (json[k])
			data[k] = json[k];
	}
	res.status(200);
	res.send(json);
}

/**
 * 
 * @param {string} filename 
 * @param {*} newData
 */
async function overrideOriginal(filename, newData)
{
	let rawOldData = await readFile(filename);
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

export {edit};
