const { getHtml } = require("./html.js");
const lib = require("./utils/lib.js");

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function view(server, client, res)
{
	client.dirName = client.dirName.replace("api", "");
	console.log(client.dirName);
	console.log(client.dataName);
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	console.log("view filename ->", filename);
	if (lib.fs.existsSync(filename) == false)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let data = lib.fs.readFileSync(filename);
	data = JSON.parse(data);
	if (data.Img)
		data.Img = server.expandedData.GetImg(client.dataName, client.dirName);
	if (data.Ico)
		data.Ico = server.expandedData.GetIco(client.dataName, client.dirName);
	res.json(data);
}

module.exports = {view};