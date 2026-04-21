const lib = require("./utils/lib.js");

/** @typedef {typeof import("../data/questData/template/trainer.json")} Trainer */

const questDataPath = "../data/questData/";
const trainerDirPath = questDataPath + "trainer/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {lib.express.Response} res 
 */
function editTrainer(server, client, res)
{
	let	trainerFile;
	let	trainerPath;
	let	trainerOldPath;
	let	trainerName;
	let	trainerOldName;
	let	trainerUpd;
	let	trainerNewData;
	let	error = null;

	trainerOldName = client.req.params.name;
	trainerName = client.body.name;
	trainerOldPath = trainerDirPath + trainerOldName + ".json"; 
	trainerPath = trainerDirPath + trainerName + ".json"; 
	trainerFile = lib.fs.readFileSync(trainerOldPath);
	trainerNewData = JSON.parse(trainerFile);
	if (
	(trainerName != trainerOldName) &&
	(server.data.trainer.indexOf(client.body.name) != -1))
		res.status(403).send(`${trainerName} is already used.`);
	trainerNewData.Name = trainerName;
	error = parseTeam(server, client.body.pkmn);
	if (error != null)
		return (res.status(400).send(error));
	for (let pkmn of client.body.pkmn)
	{
		if (pkmn.type == "DELETE")
			error = deletePkmn(server, trainerNewData, pkmn);
		else if (pkmn.type == "CREATE")
			error = createPkmn(server, trainerNewData, pkmn);
		if (error != null)
			return (res.status(500).send(error));
	}
	//lib.fs.rmSync(trainerOldPath);
	lib.fs.writeFileSync(trainerPath, JSON.stringify(trainerNewData, null, 2), 'utf-8');
}

function parseTeam(server, team)
{
	let	pkmnNorm;

	for (let pkmn of team)
	{
		let	type = pkmn.type;
		console.log(type);
		if (type == "DELETE")
		{
			if (pkmn.id == null || pkmn.reason == null)
				return (`bad request format`);
		}
		else if (type == "CREATE")
		{
			if (pkmn.name == null || typeof(pkmn.data) != "object")
				return (`bad request format`);
			pkmnNorm = lib.utils.dataNormalize(pkmn.name);
			if (server.data.pokedex.indexOf(pkmnNorm) == -1)
				return (`${pkmnNorm} specie does not exist`);
		}
		else if (type == null)
			continue ;
		else
			return (`wtf are u doin on ${trainerName} team??`) ;
	}
	return (null);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {Trainer} trainerNewData 
 * @param {*} pkmn 
 * @returns {string | null} error string
 */
function deletePkmn(server, trainerNewData, pkmn)
{
	let	path;
	let	i;

	path = server.data.GetPath("pokemon");
	path = path + pkmn.id + ".json";
	i = trainerNewData.Pokemon.indexOf(pkmn.id);
	if (i == -1)
		return ("pokemon not found in trainer");
	trainerNewData.Pokemon.splice(i, 1);
	i = server.data.pokemon.indexOf(pkmn.id);
	if (i == -1)
		return ("pokemon not found in server");
	server.data.pokemon.splice(i, 1);
	lib.fs.rmSync(path);
	return (null);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {Trainer} trainerNewData 
 * @param {*} pkmn 
 * @returns {string | null} error string
 */
function createPkmn(server, trainerNewData, pkmn)
{
	console.log(pkmn.name, pkmn.data);
	return (null);
}

// function	print(data, key="")
// {
// 	if (typeof(data) != "object")
// 		return (console.log(key, "->", data));
// 	for (let key in data)
// 	{
// 		print(data[key], key);
// 	}
// }

module.exports = {editTrainer};