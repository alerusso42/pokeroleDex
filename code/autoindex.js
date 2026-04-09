const lib = require('./utils/lib.js');
const { Server } = require('./utils/types.js');

/**
 * @param {lib.types.Server} server
 * @param {lib.types.Client} client
 * @param {import("express").Response} res
 * @returns
 */
function autoIndex(server, client, res)
{
	let listHtml = client.doc.getElementById("autoindex");
	client.dataName = client.dataName.toLowerCase();
	for (let file of server.data[client.dataName])
	{
		listHtml.innerHTML += `
			<div class="trainer-item">
				<img src="https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/absol.png" class="trainer-icon"> 
				<span class="trainer-name">${file.replace(".json", "")}</span>
			</div>
		`;
	}
	res.send(client.dom.serialize());
}

module.exports = {autoIndex};