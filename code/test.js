const lib = require('./lib.js');
const dataPath = '../data/v3.0/';

let server = lib.http.createServer((req, res) => 
	{
		let url = lib.url.parse(req.url).pathname;
		let dir = lib.utils.urlDir(url);
		let arg = lib.utils.urlArg(url);
		let dataName = arg.replaceAll("/", "");
		let dataType = dir.replaceAll("/", "");
		res.write(dir + "\n");
		if (dir == "/")
			return (tutorial(res));
		res.write(dataName + "\n");
		try 
		{
			search(dataName, dataType, res);
		}
		catch (err)
		{
			res.write(dataType + " " + dataName + " not found.");
			res.end("info: " + err + "\n");
		}
		res.end();
	}
);

server.listen(8080, "localhost");

function tutorial(res)
{
	let msg = "\
locations list:\n\
/: show this message\n\
/Abilities: show Abilities info\n\
/Items: show Items info\n\
/Moves: show Moves info\n\
/Natures: show Natures info\n\
/Pokedex: show pokemon info\n\
\n\
Example: http://localhost:8080/Pokedex/Absol\n\
";
	res.end(msg);
}

function search(dataName, dataType, res)
{
	pkmn = require('../data/v3.0/' + dataType + '/' + dataName + ".json");
	let special = false;
	for (let key in pkmn)
	{
		if (includesOneOf(key, "Ability", "Name", "Type", "Evolutions", "Move") != "")
			special = true;
		printData(pkmn[key], key, special, res);
		special = false;
		res.write("\n");
	}
}

//document.getElementById("output").innerHTML = "";

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

function printData(data, key, special, res)
{
	if (typeof(data) != "object")
	{
		let output = "";

		if (special == true)
			output = "\033[32m" + data + "\033[0m";
		else
			output = data;
		res.write(key + ":" + output);
	}
	else
	{
		for (let x in data)
		{
			printData(data[x], x, special, res);
			res.write("|");
		}
	}
}

//document.getElementById("list")