const lib = require("./utils/lib.js");

const questDataPath = "data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function edit(server, client, res)
{
	client.dirName = client.dirName.replace("api", "");
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	console.log(filename);
	if (lib.fs.existsSync(filename) == false)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let json = client.body;
	if (client.dirName == "trainer")
		createNewPokemon(server, client, json);
	lib.fs.writeFileSync(filename, JSON.stringify(json, null, 2), 'utf-8');
	res.status(200);
	res.send(json);
}

/**
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client
 * @param {typeof import {"../../data/questData/template/pokemon.json"}} json
 */
function createNewPokemon(server, client, json)
{
	let pokemon = json
}

module.exports = {edit};