// @ts-check
const {dataPath, metaDataPath, questDataPath} = require("../macro.js");
const fs = require("fs");

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
	}
	/**
	 * 
	 */
	Print()
	{
		for (let ar in this)
		{
			console.log("\x1b[32m", ar, "print:\x1b[0m");
			console.log(this[ar]);
		}
	}

	/** @param {string} dataName */
	GetPath(dataName)
	{
		// @ts-ignore
		return (dataListPath[dataName]);
	}

	/** @param {string} dirName */
	GetDirName(dirName)
	{
		// @ts-ignore
		return (dataListDirName[dirName]);
	}
}

//SECTION - dataList class methods/utils

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
		file = file.replace(".json", "");
		array.push(file);
	}
	return (array);
}

module.exports = {dataList};