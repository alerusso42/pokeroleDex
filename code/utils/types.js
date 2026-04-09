const { JSDOM } = require("jsdom");
const fs = require("fs");
const url = require("url");
const net = require('./net.js');
const stringUtils = require('./string.js');

const questDataPath = "data/questData/";
const dataPath = "data/v2.0/";

/** @typedef {typeof import("express").Request} ExpressRequest */
/** @typedef {typeof import("../../data/template/user.json")} User */
/** @typedef {typeof import("../../data/template/trainer.json")} Trainer */
/** @typedef {typeof import("../../data/template/pokemon.json")} Pokemon */

//SECTION - Server class definition

class Server
{
	constructor()
	{
		/** @type {dataList} */
		this.data = new dataList(true);
		/** @type {Map<number, User>} */
		this.userMap = getDataMap("users/", true, true);
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
 * @returns {Map}
 */
function getDataMap(typePath, readFileBool = false, useIdBool = false)
{
	let map = new Map();
	let dirName = questDataPath + typePath;
	let dir = fs.readdirSync(dirName);

	for (let file of dir)
	{
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

//SECTION - Client class definition

class Client
{
	/**
	 * 
	 * @param {Server} server 
	 * @param {Request} req 
	 * @param {String} res_html 
	 */
	constructor(server, req, res_html)
	{
		/** @type {JSDOM} */	this.dom = getHtml(res_html);

		/** @type {Document} */	this.doc = this.dom.window.document;

		/** @type {Request} */	this.req = req;

		/** @type {string} */	this.body = req.body;

		/** @type {string} */	this.buff = "";

		/** @type {string} */	this.url = url.parse(req.url).pathname;

		/** @type {User} */		this.user = getUser(server, req);

		/** @type {string} */	this.dataName = net.urlArg(this.url).replaceAll("/", "");
								this.dataName = dataNormalize(this.dataName);

		/** @type {string} */	this.dirName = net.urlDir(this.url).replaceAll("/", "");
		
		/** @type {number} */	this.dirIndex = 0;

		/** @type {boolean} */	this.isAdmin = isAdmin(req);

		/** @type {boolean} */	this.isLogged = this.user != null;

		/** @type {number} */	this.authLevel = enumAuth.UNKNOWN;

		if (this.isAdmin == true && this.isLogged == true)
			console.log("Admin", this.user.Name, "searching for \"" + this.dataName + "\"");
		else if (this.isAdmin == true)
			console.log("Admin searching for \"" + this.dataName + "\"");
		else if (this.isLogged)
			console.log("Client", this.user.Name, "searching for \"" + this.dataName + "\"");
		else
			console.log("Unrecognized Client searching for \"" + this.dataName + "\"");
	}
}

//SECTION - Client class methods/utils

function getHtml (path)
{
	const fd = fs.readFileSync(path);
	const dom = new JSDOM(fd);
	return (dom);
}

function dataNormalize(dataName)
{
	if (dataName == "")
		return ("");
	dataName = dataName[0].toUpperCase() + dataName.substring(1, dataName.length);
	if (dataName.startsWith("Mega ") == true && dataName.includes("drain") == false)
		dataName = dataNormalize(dataName.substring(5, dataName.length) + " (Mega Form)");
	let i = 0;
	while (i != dataName.length)
	{
		if (dataName[i] == ' ' || dataName[i] == '(')
			dataName = dataName.substring(0, i + 1) + dataName[i + 1].toUpperCase() + dataName.substring(i + 2, dataName.length);
		++i;
	}
	return (dataName);
}

/**
 * 
 * @param {Server} server 
 * @param {Request} req 
 * @returns {User} 
 */
function getUser(server, req)
{
	let cookie = req.headers.cookie;
	if (cookie == undefined)
		return (null);
	cookie = cookie.replace("userId=", "");
	let user = server.userMap.get(parseInt(cookie));
	if (user == undefined)
	{
		console.warn("illegal cookie", cookie);
		return (null);
	}
	return (user);
}

/**
 * 
 * @param {ExpressRequest} req 
 * @param {User} user 
 */
function isAdmin(req, user)
{
	if (stringUtils.includesOneOf(req.ip, "127.0.0.1", "localhost", "::1") != "" || 
		(user != null && user.isAdmin == true))
	{
		return (true);
	}
	return (false);
}

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
		/** @type {Array<string>} */	this.users = fillDataListArray(fill, "users");
		/** @type {Array<string>} */	this.trainers = fillDataListArray(fill, "trainers");
		/** @type {Array<string>} */	this.pokemon = fillDataListArray(fill, "pokemon");
	}
	/**
	 * 
	 * @param {dataList} dt 
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
		return (dataListPath[dataName]);
	}

	/** @param {string} dirName */
	GetDirName(dirName)
	{
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
	"users" : "users",
	"trainers" : "trainers",
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
	"users" : questDataPath + "users/",
	"trainers" : questDataPath + "trainers/",
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
	let array = new Array();
	let path = dataListPath[type];

	if (fill == false)
		return (array);
	for (let file of fs.readdirSync(path))
	{
		file = file.replace(".json", "");
		array.push(file);
	}
	return (array);
}

//SECTION generic enums

/** @enum {string} */
const enumAuth = 
{
	"UNKNOWN" : 0,
	"LOGIN" : 1,
	"WRONG_LOGIN" : 1,
	"CORRECT_LOGIN" : 2,
	"ADMIN" : 3,
};

module.exports = {Server, Client, dataList, enumAuth};