const lib = require('./lib.js');
const dataPath = '../data/v3.0/';
let out = "";

function getHtml (path) 
{
	const fd = lib.fs.readFileSync(path);
	const dom = new lib.JSDOM(fd);
	return (dom);
}

lib.app.listen(8080, "0.0.0.0");

lib.app.get("/", tutorial);

lib.app.get("/*splat", (req, res) =>
{
	out = "";
	const dom = getHtml("./code/index.html");
	const doc = dom.window.document;
	if (req.headers['user-agent'].includes("curl") == true)
		res.end("");
	console.log(req.headers['user-agent']);
	let url = lib.url.parse(req.url).pathname;
	let dir = lib.utils.urlDir(url);
	let arg = lib.utils.urlArg(url);
	let dataName = arg.replaceAll("/", "");
	let dataType = dir.replaceAll("/", "");
	dataName = dataName[0].toUpperCase() + dataName.substring(1, dataName.length);
	try 
	{
		search(dataName, dataType);
	}
	catch (err)
	{
		write(dataType + " " + dataName + " not found.");
		return (res.status(404).end("info: " + err + "\n"));
	}
	doc.getElementById("test").innerHTML += out;
	res.send(dom.serialize());
});


function tutorial(req, res)
{
	out = "";
	const dom = getHtml("./code/index.html");
	const doc = dom.window.document;
	let msgHtml = "\
locations list:<br>\
/: show this message<br>\
/Abilities: show Abilities info<br>\
/Items: show Items info<br>\
/Moves: show Moves info<br>\
/Natures: show Natures info<br>\
/Pokedex: show pokemon info<br>\
<br>\
Example: http://localhost:8080/Pokedex/Absol<br>\
";
	if (req.headers['user-agent'].includes("curl") == true)
		res.end("no.");
	else
	{
		doc.getElementById("test").innerHTML = msgHtml;
		res.send(dom.serialize());
	}
}

function search(dataName, dataType)
{
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
			write("|");
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