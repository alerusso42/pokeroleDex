// @ts-check
const lib = require('./utils/lib.js');
const { Server } = require('./utils/types.js');

const trainerBoyUrl = "https://play.pokemonshowdown.com/sprites/trainers/lucas-gen4pt.png";
const trainerGirlUrl = "https://play.pokemonshowdown.com/sprites/trainers/dawn-gen4pt.png";

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
		url = trainerBoyUrl;
		if (isFemale(file))
			url = trainerGirlUrl;
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
 * @param {String} name
 */
function isFemale(name)
{
	let	names;

	names = name.split(" ");
	name = names[0];
	if (name.at(name.length - 1) == "a")
		return (true);
	return (false);
}

module.exports = {autoIndex};