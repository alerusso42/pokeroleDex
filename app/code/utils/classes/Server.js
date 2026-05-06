// @ts-check
const fs = require("fs");
const {metaDataPath, questDataPath} = require("../macro.js");
const {dataList, expandedDataList} = require("./DataList.js");

/** @typedef {typeof import("../../../../data/questData/template/user.json")} User */

//SECTION - Server class definition

class Server
{
	constructor()
	{
		/** @type {dataList} */
		this.data = new dataList(true);

		/** @type {expandedDataList} */
		this.expandedData = new expandedDataList(this.data);

		/** @type {metaData} */
		this.metaData = new metaData();

		// @ts-ignore
		/** @type {Map<number, User>} */this.userMap = getDataMap("user/", true, true);
		
		/** @type {number} */
		this.userNum = this.userMap.size;
		
		/** @type {number} */
		this.cryptSalt = 10;

		//this.data.Print();
	}
}

//SECTION - Server class methods/utils

/**
 * 
 * @param {string} typePath the data type path 
 * @param {boolean} readFileBool the data type path 
 * @returns {Map<string, {} | string>}
 */
function getDataMap(typePath, readFileBool = false, useIdBool = false)
{
	let map = new Map();
	let dirName = questDataPath + typePath;
	let dir = fs.readdirSync(dirName);

	for (let file of dir)
	{
		if (file[0] == ".")
			continue ;
		let fileNoExt = file.replace(".json", "");
		if (readFileBool)
		{
			let json = JSON.parse(fs.readFileSync(dirName + file, 'utf-8'));
			if (useIdBool)
				map.set(json.Id, json);
			else
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
		/** @type {number} */	this.id = parseInt(fs.readFileSync(metaDataPath + "id.txt"));
	}
	Update(metaParam="", newData="")
	{
		// @ts-ignore
		if (this[metaParam] == undefined || newData == "")
			return (console.log("invalid metaData::Update params."));
		fs.writeFileSync(metaDataPath + metaParam + ".txt", String(newData));
	}
}

module.exports = {Server};