const lib = require('./utils/lib.js');
const dataPath = 'data/v2.0/';
let imgMissingno = "https://media.pokemoncentral.it/wiki/0/02/Sprrz0000.png";
let imgPkmnType = "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/{ID}.svg"
let imgBox = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/";
let imgHome = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/HomeSprites/";
let imgItem = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/";
let types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
let out = "";
let currType = 0;

lib.app.listen(8080, "0.0.0.0");

lib.app.get("/", tutorial);

function tutorial(req, res)
{
	out = "";
	const dom = getHtml("./html/index.html");
	res.send(dom.serialize());
}

function getHtml (path)
{
	const fd = lib.fs.readFileSync(path);
	const dom = new lib.JSDOM(fd);
	return (dom);
}

lib.app.get("/keyPressed*splat", (req, res) =>
{
	let url = lib.url.parse(req.url).pathname;
	let arg = lib.utils.urlArg(url);
	if (arg == "")
		return ("");
	console.log("key pressed->" + arg);
	res.send("key pressed->" + arg);
}
);

lib.app.get("/*splat", (req, res) =>
{
	out = "";
	currType = 0;
	let client = new lib.types.Client(req, "./html/result.html");
	let metaData = lib.utils.includesOneOf(client.url, "css", "favicon");
	if (client.dirName == "")
		client.dirName = types[0];
	if (metaData != "")
		return getMetaData(metaData, res);
	getData(client)
	.then(() => 
	{
		client.doc.getElementById("test").innerHTML += client.buff;
		res.send(client.dom.serialize());
	}
	).catch((err) => 
	{
		write(client, client.dirName + " " + client.dataName + " not found.");
		console.log(err);
		return (res.status(404).end("info: " + err + "\n"));
	}
	);
});

function loadImgUrl(doc, path, name)
{
	const imgTag = doc.getElementById("data-img");
	imgTag.src = path;
	if (name != null && name != "")
		imgTag.src += lib.utils.urlNormalize(name) + ".png";
	imgTag.alt = name;
}

/**
 * 
 * @param {String} metaData 
 * @param {Response} res 
 * @returns 
 */
async function getMetaData(metaData, res)
{
	if (metaData.includes("png") == true)
		return (res.send(""));
	if (metaData == "css")
		return (res.send(lib.fs.readFileSync("html/pokemon.css")));
	let url = imgBox + "rayquaza.png";
	let binary = await lib.utils.fetchBinary(url);
	res.send(binary);
}

/**
 * 
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
			loadImgUrl(client.doc, imgHome, client.dataName);
		else if (client.dirName == "Item")
			loadImgUrl(client.doc, imgItem, client.dataName);
		client.doc.getElementById("title").innerHTML = client.dirName + ": " + client.dataName; 
	}
	catch (err)
	{
		console.log(err);
		if (client.dirName == types.at(-1))
		{
			loadImgUrl(client.doc, imgMissingno, "");
			client.doc.getElementById("title").innerHTML = client.dataName + " non trovato."; 
			return (err);
		}
		client.dirIndex += 1;
		client.dirName = types.at(client.dirIndex);
		await getData(client);
	}
}

/**
 * 
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
		special = lib.utils.includesOneOf(key, "Ability", "Pokemon", "Name", "Type", "Evolutions", "Move");
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
		if (lib.utils.includesOneOf(key, "Kind", "Value", "Stat") != "")
			return ;
		write(client, `<div class="data-row">`);
		write(client, `<span class="key">${key}:</span>`);
		if (data == "")
			write(client, `<span class="value">NULL</span>`);
		else if (special != "" && key == "Item")
		{
			write(client, `<a class="badge" `);
			write(client, `href="/${key}/${data}">${data}</a>`);
		}
		else if (special != "")
		{
			write(client, `<a class="badge" `);
			write(client, `href="/${special}/${data}">${data}</a>`);
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
			write(client, `<a href="/Move/${move}" class="badge">${move}</a>`);
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