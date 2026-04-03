const lib = require('./lib.js');
const dataPath = '../data/v3.0/';
let out = "";
let curr_type = 0;
let imgMissingno = "https://media.pokemoncentral.it/wiki/0/02/Sprrz0000.png";
let imgPkmnType = "https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/{ID}.svg"
let imgBox = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/";
let imgHome = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/HomeSprites/";
let imgItem = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/";
let types = new Array("Pokemon", "Nature", "Ability", "Item");

function getHtml (path)
{
	const fd = lib.fs.readFileSync(path);
	const dom = new lib.JSDOM(fd);
	return (dom);
}

lib.app.listen(8080, "0.0.0.0");

lib.app.get("/", tutorial);

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
	console.log(req.headers['user-agent']);
	if (req.headers['user-agent'].includes("curl") == true)
		res.end("");
	out = "";
	const dom = getHtml("./html/result.html");
	const doc = dom.window.document;
	let url = lib.url.parse(req.url).pathname;
	let metaData = includesOneOf(url, "css", "favicon");
	if (metaData != "")
		return getMetaData(metaData, res);
	let dir = lib.utils.urlDir(url);
	let arg = lib.utils.urlArg(url);
	let dataName = arg.replaceAll("/", "");
	let dataType = dir.replaceAll("/", "");
	dataName = dataNormalize(dataName);
	if (dataType == "")
		dataType = types[0];
	curr_type = 0;
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

function dataNormalize(data)
{
	data = data[0].toUpperCase() + data.substring(1, data.length);
	if (data.startsWith("Mega ") == true)
		data = dataNormalize(data.substring(5, data.length) + " (Mega Form)");
	let i = 0;
	while (i != data.length)
	{
		if (data[i] == ' ' || data[i] == '(')
			data = data.substring(0, i + 1) + data[i + 1].toUpperCase() + data.substring(i + 2, data.length);
		++i;
	}
	console.log(data);
	return (data);
}


function tutorial(req, res)
{
	if (req.headers['user-agent'].includes("curl") == true)
		res.end("no.");
	out = "";
	const dom = getHtml("./html/index.html");
	res.send(dom.serialize());
}

async function getMetaData(metaData, res)
{
	if (metaData == "css")
		return (res.send(lib.fs.readFileSync("html/pokemon.css")));
	let url = imgBox + "kyogre.png";
	let binary = await lib.utils.fetchBinary(url);
	res.send(binary);
}

async function getData(dataName, dataType, doc)
{
	try 
	{
		console.log("searching in " + types.at(curr_type) + "\n");
		await search(dataName, dataType);
		console.log("found\n\n\n\n\n");
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
		curr_type += 1;
		if (dataType == types.at(-1))
		{
			loadImgUrl(doc, imgMissingno, "");
			doc.getElementById("title").innerHTML = dataName + " non trovato."; 
			return (err);
		}
		else
			await getData(dataName, types.at(curr_type), doc);
	}
}

function loadImgUrl(doc, path, name)
{
	const imgTag = doc.getElementById("data-img");
	imgTag.src = path;
	if (name != "")
		imgTag.src += lib.utils.urlNormalize(name) + ".png";
	imgTag.alt = name;
	console.log(imgTag.src);
}

function search(dataName, dataType)
{
	if (dataType.includes("..") || dataName.includes(".."))
		throw ("Searching .. or similar not allowed.\n");
	let path = 'data/v3.0/' + dataType + '/' + dataName + '.json';
	if (lib.fs.existsSync(path) == false)
	{
		throw ("file does not exist");
	}
	pkmn = JSON.parse(lib.fs.readFileSync(path, 'utf8'));
	let special = "";
	for (let key in pkmn)
	{
		special = includesOneOf(key, "Ability", "Pokemon", "Name", "Type", "Evolutions", "Move");
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

/**
 * checks if one on the strings is present in the source string
 * @param {str} str  the source string 
 * @param {str} ... one or more string to compare
 * @returns {number} the first string found if a match exists, else ""
 */
function includesOneOf(str)
{
    for (let i = 1; i != arguments.length; i++)
    {
        if (str.includes(arguments[i]) == true)
            return (arguments[i]);
    }
    return ("");
}

function printData(data, key, special)
{
	if (typeof(data) != "object")
	{
		write(`<div class="data-row">`);
		write(`<span class="key">${key}:</span>`);
		if (data == "")
			write(`<span class="value">NULL</span>`);
		else if (special != "" && key == "Item")
		{
			write(`<a class="badge" `);
			write(`href="/${key}/${data}">${data}</a>`);
		}
		else if (special != "")
		{
			write(`<a class="badge" `);
			write(`href="/${special}/${data}">${data}</a>`);
		}
		else
		{
			write(`<span class="value">${data}</span>`);
		}
		write(`</div>`);
	}
	else
	{
		for (let x in data)
		{
			printData(data[x], x, special);
			write(`<span class="separator">"|"</span>`);
		}
	}
}

function printMove(data, key)
{
	let movesMap = new Map();
	movesMap.set("Starter", []);
	movesMap.set("Rookie", []);
	movesMap.set("Standard", []);
	movesMap.set("Advanced", []);
	movesMap.set("Expert", []);
	movesMap.set("Ace", []);
	movesMap.set("Master", []);
	movesMap.set("Champion", []);
	for (let i in data)
	{
		let rank = data[i]["Learned"];
		let move = data[i]["Name"];
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