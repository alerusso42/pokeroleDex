import fs from "node:fs";
import { readDir, readFile, writeFile } from "./data.js";

/** @typedef {import('./classes/Server.js').Server} Server*/

/**
 * 
 * @param {String | JSON} path path to the json file, or the JSON parsed data 
 * @param {JSON} data new json data
 * @param {boolean} addBool true if you want not existing field to be add
 */
async function editJson(path, data, addBool=false)
{
	let oldData;

	if (typeof(path) == "string")
		oldData = await getJson(path);
	else
		oldData = path;
	if (path.indexOf(".json") == -1)
		path = path + ".json";
	for (let key in data)
	{
		console.log(`key ${key}, value ${oldData[key]}`);
		if (addBool == false && oldData[key] == undefined)
		{
			console.warn("editJson: adding new data to " + path);
		}
		else
			oldData[key] = data[key];
	}
	if (typeof(path) == "string")
		writeFile(path, JSON.stringify(oldData, null, 2));
}

/**
 * 
 * @param {String} path path to the json file
 * @param {String} dir this allow to find file root path
 * @param {Server | null} server
 */
async function getJson(path, dir="", server=null)
{
	let	rawData;
	let	data;

	if (dir && server)
	{
		path = server.data.GetPath(dir) + path;
	}
	if (path.indexOf(".json") == -1)
		path = path + ".json";
	rawData = await readFile(path);
	data = JSON.parse(rawData);
	return (data);
}

export {editJson, getJson};
