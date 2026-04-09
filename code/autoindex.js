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
	let listHtml = client.doc.getElementById("autoindex");
	let url = trainerUrl;

	console.log(client.dirName);
	client.dirName = client.dirName.toLowerCase().replaceAll("/", " ");
	for (let file of server.data[client.dirName])
	{
		listHtml.innerHTML += `
			<div class="trainer-item">
				<img src="${url}" class="trainer-icon"> 
				<span class="trainer-name">${file.replace(".json", "")}</span>
			</div>
		`;
	}
	res.send(client.dom.serialize());
}

module.exports = {autoIndex};