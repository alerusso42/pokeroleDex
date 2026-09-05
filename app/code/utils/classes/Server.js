// @ts-check
import fs from "node:fs";
import {metaDataPath, questDataPath, questImgPath} from "../macro.js";
import {dataList, expandedDataList, dataListPath} from "./DataList.js";
import { readDir, readFile, writeFile } from "../data.js";

/** @typedef {typeof import("../../../../data/questData/template/user.json")} User */

//SECTION - Server class definition

class Server
{
	constructor()
	{
		/** @type {dataList} */
		this.data = dataList;

		/** @type {expandedDataList} */
		this.expandedData = expandedDataList;

		/** @type {metaData} */
		this.metaData = new metaData();

		// @ts-ignore
		/** @type {Map<number, User>} */this.userMap = new Map();
		
		/** @type {number} */
		this.userNum = this.userMap.size;
		
		/** @type {number} */
		this.cryptSalt = 10;

		//this.data.Print();
	}
	async Init()
	{// @ts-ignore
		this.userMap = await getDataMap("user/", true);
	}
}

//SECTION - Server class methods/utils

/**
 * 
 * @param {string} typePath the data type path 
 * @param {boolean} readFileBool the data type path 
 * @returns {Promise<Map<string, {} | string>>}
 */
async function getDataMap(typePath, readFileBool = false, useIdBool = false)
{
	let map = new Map();
	let dirName = questDataPath + typePath;
	let dir = readDir(dirName);
	let	i;

	i = 0;
	for (let file of dir)
	{
		if (file[0] == ".")
			continue ;
		let fileNoExt = file.replace(".json", "");
		if (readFileBool && !useIdBool)
		{
			let json = JSON.parse(await readFile(dirName + file));
			if (!json.File)
				json.File = dataListPath.user + json.Name + ".json";
			map.set(fileNoExt, json);
		}
		else
			map.set(fileNoExt, file);
	}
	return (map);
}

class metaData
{
	constructor()
	{
		// @ts-ignore
		/** @type {number} */	this.id = 0;
	}
	async Update(metaParam="", newData="")
	{
		// @ts-ignore
		if (this[metaParam] == undefined || newData == "")
			return (console.log("invalid metaData::Update params."));
		writeFile(metaDataPath + metaParam + ".txt", String(newData));
	}
}

export {Server};
