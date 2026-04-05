const lib = require('./utils/lib.js');
const html = require('./html.js');
const dataPath = 'data/v2.0/';
const imgMissingno = "https://media.pokemoncentral.it/wiki/0/02/Sprrz0000.png";
const imgPkmnType = "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/{ID}.svg"
const imgHome = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/HomeSprites/";
const imgItem = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/";
const types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
const linkSpecial = new Array("Ability", "Pokemon", "Name", "Type", "Evolutions", "Move");
const linkIgnored = new Array("Kind", "Value", "Stat");

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
			html.loadImgUrl(client.doc, imgMissingno, "");
			client.doc.getElementById("title").innerHTML = client.dataName + " non trovato."; 
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

module.exports = {getData};
