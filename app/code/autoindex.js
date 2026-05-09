// @ts-check
const lib = require('./utils/lib.js');
const { dataNormalize, pokemonToSnakeCase } = require('./utils/string.js');
const { Server } = require('./utils/classes/classes.js');

const	trainerBoyUrl = "https://play.pokemonshowdown.com/sprites/trainers/lucas-gen4pt.png";
const	trainerGirlUrl = "https://play.pokemonshowdown.com/sprites/trainers/dawn-gen4pt.png";
const	pokemonUrl = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/";

/**
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client
 * @param {import("express").Response} res
 * @returns
 */
function autoIndex(server, client, res)
{
	let list = client.doc.getElementById("autoindex");
	let url;

	if (!list)
		return (res.send(client.dom.serialize()));
	client.dirName = client.dirName.toLowerCase().replaceAll("/", " ");
	for (let file of server.data[client.dirName])
	{
		url = getUrl(server, file, client.dirName);
		console.log(file);
		file = file.replace(".json", "");
		list.innerHTML += `
			<div class="trainer-item">
				<img src="${url}" class="trainer-icon"> 
				<a href="/${client.dirName}/${file}" class="trainer-name">${file}</a>
			</div>
		`;
	}
	res.send(client.dom.serialize());
}

/**
 * 
 * @param {lib.types.Server} server
 * @param {String} contentName 
 * @param {String} type 
 */
function getUrl(server, contentName, type)
{
	let	lastUnderscore;
	let	url;

	lastUnderscore = contentName.lastIndexOf("_");
	if (lastUnderscore != -1)
		contentName = contentName.slice(0, lastUnderscore);
	switch (type)
	{
		case ("pokemon") :
		{
			console.log(pokemonUrl + contentName);
			return (pokemonUrl + pokemonToSnakeCase(contentName) + ".png");
		}
		case ("trainer") : case ("user") :
		{
			url = server.expandedData.GetIco(contentName, type);
			if (url)
				return (url);
			if (isFemale(contentName) == true)
				return (trainerGirlUrl);
			return (trainerBoyUrl);
		}
	}
}

/**
 * @param {String} name
 */
function isFemale(name)
{
	let	names;

	names = name.split(" ");
	name = names[0];
	name = name.toLocaleLowerCase();
	if (name == "elia")
		return (false);
	if (name.at(-1) == "a")
		return (true);
	return (false);
}

module.exports = {autoIndex};