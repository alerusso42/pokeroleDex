const lib = require('./lib.js');
const dataPath = '../data/v3.0/';
let out = "";
let curr_type = 0;
let imgBox = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/";
let imgHome = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/HomeSprites/";
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
	dataName = dataName[0].toUpperCase() + dataName.substring(1, dataName.length);
	if (dataType == "")
		dataType = types[0];
	curr_type = 0;
	getData(dataName, dataType)
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

async function getData(dataName, dataType)
{
	try 
	{
		search(dataName, dataType);
	}
	catch (err)
	{
		curr_type += 1;
		console.log("searching in " + types.at(curr_type) + "\n");
		if (dataType == types.at(-1))
			return (err);
		else
			getData(dataName, types.at(curr_type));
	}
	try 
	{
		let search = dataName.toLowerCase();
		let url = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/";
		if (dataType == "Pokemon")
			url += `HomeSprites/${search}.png`;
		else if (dataType == "Item")
			url += `HomeSprites/${search}.png`;
		else
			url = "test";
		console.log(`risultato: ${url}`);
	}
	catch (error)
	{
		console.log(`errore ${error}`);
		return (error);
	}
	return ("");
}

function search(dataName, dataType)
{
	if (dataType.includes("..") || dataName.includes(".."))
		throw ("Searching .. or similar not allowed.\n");
	pkmn = require('../data/v3.0/' + dataType + '/' + dataName + ".json");
	let special = "";
	for (let key in pkmn)
	{
		special = includesOneOf(key, "Ability", "Pokemon", "Name", "Type", "Evolutions", "Move");
		if (special == "Evolutions" || special == "Name")
			special = "Pokemon";
		if (special == "Move")
			printMove(pkmn[key], key);
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
		if (special != "" && key == "Item")
			write(`<a href="/${key}/${data}">${data}</a>`);
		else if (special != "")
		{
			write(`<a class="data-row" href="/${special}/${data}">${key}:${data}</a>`);
		}
		else
		{
			write(`<div class="data-row">
			<span class="key">${key}:</span> 
			<span class="value">${data}</span>
			</div>`);
		}
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
	let starter = new Array();
	let rookie = new Array();
	let standard = new Array();
	let advanced = new Array();
	let expert = new Array();
	let ace = new Array();
}

//function printSingleMov()

function write(msg)
{
	out += msg;
}
//doc.getElementById("list")