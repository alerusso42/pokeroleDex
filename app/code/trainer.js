const lib = require("./utils/lib.js");

/** @typedef {typeof import("../data/questData/template/trainer.json")} Trainer */

const	questDataPath = "../data/questData/";
const	trainerDirPath = questDataPath + "trainer/";
const	trainerTemplate = questDataPath + "template/" + "trainer.json";
const	pokemonTemplate = questDataPath + "template/" + "pokemon.json";

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
	let	i;

	i = -1;
	for (let pkmn of team)
	{
		i++;
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
			team[i].name = pkmnNorm;
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
	let	id = createUniqueId(server, pkmn.name);
	pkmn.id = id;
	let	specieFilename = server.data.GetPath("pokedex") + pkmn.name + ".json";
	let	newFilename = server.data.GetPath("pokemon") + id + ".json";
	let	dataTemplate = JSON.parse(lib.fs.readFileSync(pokemonTemplate));
	let	dataSpecie = JSON.parse(lib.fs.readFileSync(specieFilename));
	let	dataNew = dataTemplate;

	// 1. Dati Identità
    dataNew.Species = dataSpecie.Name;
    dataNew.Name = dataSpecie.Name;
    dataNew.Trainer = trainerNewData.Name;
    dataNew.Type1 = dataSpecie.Type1;
    dataNew.Type2 = dataSpecie.Type2 || "";
    dataNew.Id = id;

    // 2. Mappatura Attributi (Current e Max)
    dataNew.HP.current = dataSpecie.BaseHP;
    dataNew.HP.max = dataSpecie.BaseHP;
    const attrs = ["Strength", "Dexterity", "Vitality", "Special", "Insight"];
    attrs.forEach((attr) => 
	{
        if (dataSpecie[attr] !== undefined)
		{
            dataNew[attr].current = dataSpecie[attr];
            dataNew[attr].max = dataSpecie[`Max${attr}`] || dataSpecie[attr];
        }
    });
	const skills = ["Brawl", "Channel", "Clash", "Evasion", "Alert", "Athletics", "Nature", "Stealth", "Initiative"];
	for (let skill of skills)
		dataNew[skill] = 1;

    // 3. Abilità
    if (dataSpecie.Ability1)
	{
        dataNew.Ability.Name = dataSpecie.Ability1;
        dataNew.Ability.Effect = "";
        dataNew.Ability.Description = "";
    }

    // 4. Dati Fisici e Bio
    dataNew.Height = dataSpecie.Height;
    dataNew.Weight = dataSpecie.Weight;
    dataNew.DexDescription = dataSpecie.DexDescription;
    dataNew.Evolutions = dataSpecie.Evolutions;
    dataNew.Moves = dataSpecie.Moves.map((m) => 
	{
		return { Name: m.Name, Learned: m.Learned }; 
    });
	dataNew.Moves.slice(0, 4);
	lib.fs.writeFileSync(newFilename, JSON.stringify(dataNew, null, 2), 'utf-8');
	server.data.pokemon.push(id);
	trainerNewData.Pokemon.push(id);
	return (null);
}

/**
 * 
 * @param {lib.types.Server} server 
 * @param {String} pkmn 
 * @returns {string} unique id
 */
function	createUniqueId(server, pkmn)
{
	let	i;
	let	path;

	path = pkmn;
	if (server.data.pokemon.includes(path) == false)
		return (pkmn);
	i = 1;
	path = `${pkmn}_${i}`;
	while (server.data.pokemon.includes(path) == true)
	{
		i++;
		path = `${pkmn}_${i}`;
	}
	return (`${pkmn}_${i}`);
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