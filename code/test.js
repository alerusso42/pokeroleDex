const lib = require('./lib.js');

let server = lib.http.createServer((req, res) => 
	{
		let url = lib.url.parse(req.url).pathname;
		res.write(url + "\n");
		search("Absol", res);
		res.end();
	}
);

server.listen(8080, "localhost");

function search(pokemon, res)
{
	pkmn = require('../data/v3.0/Pokedex/' + pokemon + ".json");
	for (let key in pkmn)
	{
		printKey(key, res);
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

function printKey(key, res)
{
    if (includesOneOf(key, "Ability", "Name", "Type", "Evolutions", "Move") != "")
		res.write("special!!" + "key" + key + ":" + pkmn[key]);
	else
		res.write("key" + key + ":" + pkmn[key]);
}

//document.getElementById("list")