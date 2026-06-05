//@ts-check
const lib = require('./utils/lib.js');
const html = require('./html.js');
const { getJson } = require('./utils/json.js');
const {validSearch} = require("./login.js");
const { includesOneOf } = require('./utils/string.js');
const { questDataPath } = require('./utils/macro.js');
const { Server } = require('./utils/classes/Server.js');
const { Client } = require('./utils/classes/Client.js');
const { condCheck, condSanifier } = require('./utils/conds.js');
const dataPath = '../data/v2.0/';
const imgMissingno = "https://media.pokemoncentral.it/wiki/0/02/Sprrz0000.png";
const imgSigma = "https://imgcdn.stablediffusionweb.com/2024/3/17/3dc94a28-83bd-4f7c-b33e-71652870473a.jpg";
const imgPkmnType = "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/{ID}.svg"
const imgHome = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/HomeSprites/";
const imgItem = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/";
const types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
const lowCaseTypes = new Array("pokedex", "move", "nature", "ability", "item");
const expLowCaseTypes = new Array("user", "trainer", "pokemon", "category", "world");
const linkSpecial = new Array("Ability", "Pokemon", "Name", "Type", "Evolutions", "Move");
const linkIgnored = new Array("Kind", "Value", "Stat");
const dataNormalize = lib.utils.dataNormalize;
const {resolveField} = require("./utils/conds.js");

//SECTION - getData

/**
 * @description tries to open every possible data directory at the same time.
 * client buffer is updated, regarding of the outcome.
 * @param {lib.types.Client} client 
 * @returns {String} "" if success, else string with error
 */
async function getData(client)
{
	try 
	{
		console.log("searching in " + types.at(client.dirIndex));
		await search(client);
		console.log("found.");
		if (client.dirName == "Pokemon")
			html.loadImgUrl(client.doc, imgHome, client.dataName);
		else if (client.dirName == "Item")
			html.loadImgUrl(client.doc, imgItem, client.dataName);
		client.doc.getElementById("title").innerHTML = client.dirName + ": " + client.dataName; 
	}
	catch (err)
	{
		console.log(err);
		if (client.dirName == types.at(-1))
		{
			html.loadImgUrl(client.doc, imgSigma, "");
			client.doc.getElementById("title").innerHTML = "<br>" + client.dataName + " non trovato.<br>";
			client.doc.getElementById("title").innerHTML += `${getRandomQuote()}`;
			return (err);
		}
		client.dirIndex += 1;
		client.dirName = types.at(client.dirIndex);
		await getData(client);
	}
}

/**
 * @description prints on the client buffer the data html.
 * @throws on error, returns to getData try catch block.
 * @param {lib.types.Client} client 
 */
function search(client)
{
	if (client.dirName.includes("..") || client.dataName.includes(".."))
		throw ("Searching .. or similar not allowed.\n");
	let path = dataPath + client.dirName + '/' + client.dataName + '.json';
	if (lib.fs.existsSync(path) == false)
	{
		console.log(path);
		throw ("file does not exist");
	}
	pkmn = JSON.parse(lib.fs.readFileSync(path, 'utf8'));
	let special = "";
	for (let key in pkmn)
	{
		special = lib.utils.includesOneOf(key, linkSpecial);
		if (special == "Evolutions" || special == "Name")
			special = "Pokemon";
		else if (key == "GenderType")
			special = "";
		if (special == "Move")
			printMove(client, pkmn[key]);
		else
			printData(client, pkmn[key], key, special);
		special = "";
		write(client, "<br>");
	}
}

/**
 * 
 * @param {lib.types.Client} client 
 * @param {String} key 
 * @param {String} special 
 * @returns 
 */
function printData(client, data, key, special)
{
	if (typeof(data) != "object")
	{
		if (lib.utils.includesOneOf(key, linkIgnored) != "")
			return ;
		write(client, `<div class="data-row">`);
		write(client, `<span class="key">${key}:</span>`);
		if (data == "")
			write(client, `<span class="value">NULL</span>`);
		else if (special != "" && key == "Item")
		{
			write(client, `<a class="badge" `);
			write(client, `href="/search/${key}/${data}">${data}</a>`);
		}
		else if (special != "")
		{
			write(client, `<a class="badge" `);
			write(client, `href="/search/${special}/${data}">${data}</a>`);
		}
		else
		{
			write(client, `<span class="value">${data}</span>`);
		}
		write(client, `</div>`);
	}
	else
	{
		for (let x in data)
		{
			printData(client, data[x], x, special);
			write(client, `<span class="separator">"|"</span>`);
		}
	}
}

function printMove(client, moveData)
{
	let movesMap = new Map();

	movesMap.set("Starter", []);
	movesMap.set("Beginner", []);
	movesMap.set("Amateur", []);
	movesMap.set("Ace", []);
	movesMap.set("Pro", []);
	movesMap.set("Master", []);
	for (let i in moveData)
	{
		let rank = moveData[i]["Learned"];
		let move = moveData[i]["Name"];
		movesMap.get(rank).push(move);
	}
	write(client, `<h3 class="section-title">Moveset per Grado</h3>`);
	for (let [rank, moves] of movesMap)
	{
		write(client, `<div class="rank-header">${rank}</div>`);
		for (let move of moves)
		{
			write(client, `<a href="/search/Move/${move}" class="badge">${move}</a>`);
		}
		write(client, `</div>`);
	}
}

/**
 * 
 * @param {lib.types.Client} client 
 * @param {String} msg 
 */
function write(client, msg)
{
	client.buff += msg;
}

//SECTION - searchByKey

/**
 * 
 * @param {string} key 
 * @param {lib.types.dataList} data 
 * @param {Array<string>} validArray 
 * @returns {lib.types.dataList}
 */
function searchByKey(key, data, validArray = [])
{
	let match = new lib.types.dataList(false);
	let	ascii;

	if (validArray == undefined)
		validArray = [];
	key = dataNormalize(key);
	for (const dataName in data)
	{
		if (includesOneOf(dataName, lowCaseTypes) == "")
			continue ;
		if (validArray.length == 0 || validArray.includes(dataName) == true)
			addMatchByKey(key, data[dataName], match[dataName]);
	}
	for (const key in match)
	{
		ascii = key.charCodeAt(0);
		if (ascii >= "A".charCodeAt(0) && ascii <= "Z".charCodeAt(0))
			delete match[key];
	}
	return (match);
}

/** @typedef {import("../metadata/cond.json")} Cond*/
/** @typedef {Array<Cond>} Conds*/
/** @typedef {import('./utils/classes/DataList.js').ExpPrototype} ExpData*/
/** @typedef {Map<string, ExpData>} ExpDataMap*/
/** @typedef {Array<ExpData>} ExpDataArray*/

/**
 * 
 * @param {Server} server
 * @param {Client} client
 * @param {string} field
 * @param {boolean} checkValidBool
 * @returns {*}
 */
function searchByDataExpanded(server, client, field="", checkValidBool=true)
{
	/** @type {Conds} */	let	conds;
	/** @type {ExpData}*/let	data;
	/** @type {Set<*>}*/let match;
	let	json;
	let	key;
	let	dir;

	//@ts-ignore
	conds = client.body.conds;
	if (Array.isArray(conds) == false)
		throw Error(`searchByKeyExp: received invalid array => ${conds}`);
	if (condSanifier(conds) == false)
		throw Error(`searchByKeyExp: cannot sanify => ${conds}`);
	key = dataNormalize(client.dataName);
	dir = dataNormalize(client.dirName);
	if (!includesOneOf(dir, expLowCaseTypes) && !includesOneOf(dir, lowCaseTypes))
		throw Error(`searchByKeyExp: invalid dir => ${dir}`);
	match = new Set();
	//@ts-ignore
	data = server.expandedData[dir];
	if (!data)
		throw Error(`searchByKeyExp: error getting dataSet for => ${dir}`);
	//@ts-ignore
	data = server.expandedData[dir][key];
	if (!data)
		throw Error(`searchByKeyExp: error getting dataSet for => ${dir}`);
	if (!data.Id)
		Error(`searchByKeyExp: invalid data => ${data}`);
	if (checkValidBool == true && !validSearch(server, client, data.Id))
		return (undefined);
	json = server.expandedData.GetData(data.Id, dir);
	if (typeof(json) != "object")
		throw Error(`searchByKeyExp: trash data => ${json}`);
	if (field)
		json = resolveField(json, field);
	if (!json)
		return (undefined);
	//@ts-ignore
	for (const field of json)
	{
		if (condCheck(field, conds) == false)
			continue ;
		match.add(field);
	}
	return (match);
}

/**
 * 
 * @param {Server} server
 * @param {Client} client
 * @param {string} input
 * @param {boolean} checkValidBool
 * @returns {ExpDataArray}
 */
function searchByDirExpanded(server, client, input, checkValidBool=true)
{
	/** @type {Conds} */	let	conds;
	/** @type {ExpDataMap}*/let	dataSet;
	/** @type {ExpDataArray}*/let match;
	let	json;
	let	dir;

	//@ts-ignore
	conds = client.body.conds;
	if (Array.isArray(conds) == false)
		throw Error(`searchByKeyExp: received invalid array => ${conds}`);
	if (condSanifier(conds) == false)
		throw Error(`searchByKeyExp: cannot sanify => ${conds}`);
	dir = client.dirName.toLocaleLowerCase();
	if (!includesOneOf(dir, expLowCaseTypes) && !includesOneOf(dir, lowCaseTypes))
		throw Error(`searchByKeyExp: invalid dir => ${dir}`);
	match = new Array();
	//@ts-ignore
	dataSet = server.expandedData[dir];
	if (!dataSet)
		throw Error(`searchByKeyExp: error getting dataSet for => ${dir}`);
	for (const [key, data] of dataSet)
	{
		data.Id = key;
		if (input && data.Id.startsWith(input, 0) == false)
			continue ;
		if (checkValidBool == true && !validSearch(server, client, data.Id))
			continue ;
		json = getJson(key, dir, server);
		if (typeof(json) != "object")
			throw Error(`searchByKeyExp: trash data => ${json}`);
		if (key == "Eevee")
			console.log(key);
		if (condCheck(json, conds) == false)
			continue ;
		match.push(json);
	}
	return (match);
}

/**
 * 
 * @param {string} key 
 * @param {Array<string>} array 
 * @param {Array<string>} match 
 */
function addMatchByKey(key, array, match = [])
{
	if (!array || typeof(array) != "object")
		return ;
	for (let x of array)
	{
		if (x.startsWith(key) == true)
		{
			match.push(x);
		}
	}
}

function getRandomQuote()
{
	try
	{
		let quotesJson = lib.utils.getJson(`${questDataPath}/other/randomQuote`);
		let	quotes = quotesJson.quote;
		let rand = Math.floor(Math.random() * quotes.length);
		console.log(rand);

		return (quotes[rand]);
	}
	catch (error)
	{
		console.log(error);
		return ("");
	}
}

module.exports = {getData, searchByKey, searchByDataExpanded, searchByDirExpanded};