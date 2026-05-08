// @ts-check
const fs = require("fs");
const {dataPath, metaDataPath, questDataPath} = require("../macro.js");
const {getJson} = require("../json.js");

//SECTION - dataList class definition

class dataList
{
	/**
	 * 
	 * @param {boolean} fill
	 */
	constructor(fill)
	{
		/** @type {Array<string>} */	this.pokedex = fillDataListArray(fill, "pokedex");
		/** @type {Array<string>} */	this.nature = fillDataListArray(fill, "nature");
		/** @type {Array<string>} */	this.move = fillDataListArray(fill, "move");
		/** @type {Array<string>} */	this.item = fillDataListArray(fill, "item");
		/** @type {Array<string>} */	this.ability = fillDataListArray(fill, "ability");
		/** @type {Array<string>} */	this.user = fillDataListArray(fill, "user");
		/** @type {Array<string>} */	this.trainer = fillDataListArray(fill, "trainer");
		/** @type {Array<string>} */	this.pokemon = fillDataListArray(fill, "pokemon");
		
		this.Print = print.bind(this);
		this.GetPath = getPath;
		this.GetDirName = getDirName;
		this.GetFilename = getfilename;
	}
}

//SECTION - dataList class methods/utils

/**
 * 
 * @this {*}
 */
function print()
{
	if (!this)
		return ;
	for (let ar in this)
	{
		console.log("\x1b[32m", ar, "print:\x1b[0m");
		// @ts-ignore
		console.log(this[ar]);
	}
}

/** @param {string} dataName */
function getPath(dataName)
{
	// @ts-ignore
	return (dataListPath[dataName]);
}

/** @param {string} dirName */
function getDirName(dirName)
{
	// @ts-ignore
	return (dataListDirName[dirName]);
}

/**
 * 
 * @param {string} dataName 
 * @param {string} dirName 
 * @param {string} root 
 * @param {string} ext 
 * @param {boolean} checkExistBool
 */
function getfilename(dataName, dirName="", root=questDataPath, ext="json", checkExistBool=true)
{
	let	filename;

	if (!dataName)
		throw ("getFilename: dataName is null");
	filename = root + dirName + "/" + dataName + `.${ext}`;
	if (checkExistBool == true && fs.existsSync(filename) == false)
		throw ("getFilename: cannot find " + filename);
	return (filename);
}

/** @enum {string} */
const dataListDirName = 
{
	"pokedex" : "Pokemon",
	"nature" : "Nature",
	"move" : "Move",
	"item" : "Item",
	"ability" : "Ability",
	"user" : "user",
	"trainer" : "trainer",
	"pokemon" : "pokemon"
};

/** @enum {string} */
const dataListPath = 
{
	"pokedex" : dataPath + "Pokemon/",
	"nature" : dataPath + "Nature/",
	"move" : dataPath + "Move/",
	"item" : dataPath + "Item/",
	"ability" : dataPath + "Ability/",
	"user" : questDataPath + "user/",
	"trainer" : questDataPath + "trainer/",
	"pokemon" : questDataPath + "pokemon/"
};

/**
 * 
 * @param {boolean} fill
 * @param {string} type 
 * @returns {Array<string>} the array filled with all files in that directory
 */
function fillDataListArray(fill, type)
{
	// @ts-ignore
	let path = dataListPath[type];
	let array = new Array();

	if (fill == false)
		return (array);
	for (let file of fs.readdirSync(path))
	{
		if (file[0] == ".")
			continue ;
		file = file.replace(".json", "");
		array.push(file);
	}
	return (array);
}

//SECTION - expanded data list

/**
 * @typedef {Object} ExpPrototype
 * @property {string} filename
 * @property {string} Img Img extension or url
 * @property {string} Ico Ico extension or url
 * @property {string} category category of data
 */

class expandedDataList
{
	/** @param {dataList} list */
	constructor(list)
	{
		//this.pokedex = fillDataListExpanded(list, "pokedex", dataPath);
		//this.nature = fillDataListExpanded(list, "nature", dataPath);
		//this.move = fillDataListExpanded(list, "move", dataPath);
		//this.item = fillDataListExpanded(list, "item", dataPath);
		//this.ability = fillDataListExpanded(list, "ability", dataPath);
		this.user = fillDataListExpanded(list, "user");
		this.trainer = fillDataListExpanded(list, "trainer");
		this.pokemon = fillDataListExpanded(list, "pokemon");

		this.Print = printExp.bind(this);
		this.GetPath = getPath;
		this.GetDirName = getDirName;
		this.GetFilename = getfilename;

	}
}

/**
 * 
 * @param {dataList} list the lists of data divided by directories
 * @param {string} type the directory name 
 * @returns {Map<string, ExpPrototype>}
 */
function fillDataListExpanded(list, type, root=questDataPath)
{
	/**  @type {ExpPrototype}*/let	expData;
	let	arrayFiles;
	let	mapExpData;
	let	filename;
	let	json;

	// @ts-ignore
	expData = {};
	mapExpData = new Map();
	// @ts-ignore
	arrayFiles = list[type];
	if (!arrayFiles)
		throw ("fillDataListExpanded: cannot init type " + type);
	for (let data of arrayFiles)
	{
		filename = getfilename(data, getDirName(type), root);
		json = getJson(filename);
		expData.filename = filename;
		if (json.Category)
			expData.category = json.category;
		expData.Img = json.Img;
		expData.Ico = json.Ico;
		mapExpData.set(data, expData);
	}
	return (mapExpData);
}

/**
 * 
 * @this {*}
 */
function printExp()
{
	if (!this)
		return ;
	for (let ar in this)
	{
		console.log("\x1b[32m", ar, "print:\x1b[0m");
		// @ts-ignore
		console.log(this[ar]);
	}
}

module.exports = {dataList, expandedDataList};