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
	const dom = getHtml("./html/result.html");
	const doc = dom.window.document;
	let url = lib.url.parse(req.url).pathname;
	let metaData = lib.utils.includesOneOf(url, "css", "favicon");
	if (metaData != "")
		return getMetaData(metaData, res);
	let dir = lib.utils.urlDir(url);
	let arg = lib.utils.urlArg(url);
	let dataName = arg.replaceAll("/", "");
	let dataType = dir.replaceAll("/", "");
	dataName = dataNormalize(dataName);
	if (dataType == "")
		dataType = types[0];
	currType = 0;
	console.log("Searching \"" + dataName + "\"");
	getData(dataName, dataType, doc)
	.then(() => 
	{
		doc.getElementById("test").innerHTML += out;
		res.send(dom.serialize());
	}
	).catch((err) => 
	{
		write(dataType + " " + dataName + " not found.");
		console.log(err);
		return (res.status(404).end("info: " + err + "\n"));
	}
	);
});

/**
 * 
 * @param {String} dataName
 * @param {Client} client
 * @returns {String}
 */
function dataNormalize(dataName, client)
{
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

function getHtml (path)
{
	const fd = lib.fs.readFileSync(path);
	const dom = new lib.JSDOM(fd);
	return (dom);
}

function loadImgUrl(doc, path, name)
{
	const imgTag = doc.getElementById("data-img");
	imgTag.src = path;
	if (name != null && name != "")
		imgTag.src += lib.utils.urlNormalize(name) + ".png";
	imgTag.alt = name;
}

async function getMetaData(metaData, res)
{
	if (metaData == "css")
		return (res.send(lib.fs.readFileSync("html/pokemon.css")));
	let url = imgBox + "rayquaza.png";
	let binary = await lib.utils.fetchBinary(url);
	res.send(binary);
}

async function getData(dataName, dataType, doc)
{
	try 
	{
		console.log("searching in " + types.at(currType));
		await search(dataName, dataType);
		console.log("found.");
		let url = "";
		if (dataType == "Pokemon")
			url = imgHome;
		else if (dataType == "Item")
			url = imgItem;
		loadImgUrl(doc, url, dataName);
		doc.getElementById("title").innerHTML = dataType + ": " + dataName; 
	}
	catch (err)
	{
		console.log(err);
		currType += 1;
		if (dataType == types.at(-1))
		{
			loadImgUrl(doc, imgMissingno, "");
			doc.getElementById("title").innerHTML = dataName + " non trovato."; 
			return (err);
		}
		else
			await getData(dataName, types.at(currType), doc);
	}
}

function search(dataName, dataType)
{
	if (dataType.includes("..") || dataName.includes(".."))
		throw ("Searching .. or similar not allowed.\n");
	let path = dataPath + dataType + '/' + dataName + '.json';
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
			printMove(pkmn[key], key);
		else
			printData(pkmn[key], key, special);
		special = "";
		write("<br>");
	}
}

//doc.getElementById("output").innerHTML = "";

function printData(dataName, key, special)
{
	if (typeof(dataName) != "object")
	{
		if (lib.utils.includesOneOf(key, "Kind", "Value", "Stat") != "")
			return ;
		write(`<div class="data-row">`);
		write(`<span class="key">${key}:</span>`);
		if (dataName == "")
			write(`<span class="value">NULL</span>`);
		else if (special != "" && key == "Item")
		{
			write(`<a class="badge" `);
			write(`href="/${key}/${dataName}">${dataName}</a>`);
		}
		else if (special != "")
		{
			write(`<a class="badge" `);
			write(`href="/${special}/${dataName}">${dataName}</a>`);
		}
		else
		{
			write(`<span class="value">${dataName}</span>`);
		}
		write(`</div>`);
	}
	else
	{
		for (let x in dataName)
		{
			printData(dataName[x], x, special);
			write(`<span class="separator">"|"</span>`);
		}
	}
}

function printMove(dataName, key)
{
	let movesMap = new Map();
	movesMap.set("Starter", []);
	movesMap.set("Beginner", []);
	movesMap.set("Amateur", []);
	movesMap.set("Ace", []);
	movesMap.set("Pro", []);
	movesMap.set("Master", []);
	for (let i in dataName)
	{
		let rank = dataName[i]["Learned"];
		let move = dataName[i]["Name"];
		movesMap.get(rank).push(move);
	}
	write(`<h3 class="section-title">Moveset per Grado</h3>`);
	for (let [rank, moves] of movesMap)
	{
		write(`<div class="rank-header">${rank}</div>`);
		for (let move of moves)
		{
			write(`<a href="/Move/${move}" class="badge">${move}</a>`);
		}
		write(`</div>`);
	}
}

//function printSingleMov()

function write(msg)
{
	out += msg;
}