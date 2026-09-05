import { getHtml } from "./html.js";
import { existFile, readFile } from "./utils/data.js";
import * as lib from "./utils/lib.js";

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
async function view(server, client, res)
{
	client.dirName = client.dirName.replace("api", "");
	console.log(client.dirName);
	console.log(client.dataName);
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(await getHtml("./html/error/404.html").serialize());
		return ;
	}
	let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	console.log("view filename ->", filename);
	if (await existFile(filename) == false)
	{
		res.status(404);
		res.end(await getHtml("./html/error/404.html").serialize());
		return ;
	}
	let data = await readFile(filename);
	data = JSON.parse(data);
	if (data.Img)
		data.Img = server.expandedData.GetImg(client.dataName, client.dirName);
	if (data.Ico)
		data.Ico = server.expandedData.GetIco(client.dataName, client.dirName);
	res.json(data);
}

export {view};
