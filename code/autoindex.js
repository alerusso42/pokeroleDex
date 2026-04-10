const lib = require('./utils/lib.js');
const { Server } = require('./utils/types.js');

const trainerUrl = "https://play.pokemonshowdown.com/sprites/trainers/lucas-gen4pt.png";

/**
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client
 * @param {import("express").Response} res
 * @returns
 */
function autoIndex(server, client, res)
{
	let list = client.doc.getElementById("autoindex");
	let url = trainerUrl;

	client.dirName = client.dirName.toLowerCase().replaceAll("/", " ");
	for (let file of server.data[client.dirName])
	{
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

module.exports = {autoIndex};