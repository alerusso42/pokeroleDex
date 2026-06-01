const lib = require("./utils/lib.js");

const questDataPath = "../data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function edit(server, client, res)
{
	let	id;
	let	img;
	let	ico;

	//client.dataName = client.dataName.replace("", "");
	client.dirName = client.dirName.replace("api", "");
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	// let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	let filename = server.data.GetFilename(client.dataName, client.dirName);
	// let json = JSON.parse(client.body);
	let json = client.body;
	console.log(client.req.query);
	if (client.req.query && client.req.query.onlySome)
		overrideOriginal(filename, json);
	if (json.Name)
		id = server.expandedData.SetId(client.dataName, client.dirName, json.Name);
	json.id = id;
	img = server.expandedData.GetImg(id, client.dirName);
	ico = server.expandedData.GetIco(id, client.dirName);
	if (img)
		json.Img = img.slice(img.lastIndexOf("."), img.length);
	if (ico)
		json.Ico = ico.slice(ico.lastIndexOf("."), ico.length);
	lib.fs.writeFileSync(filename, JSON.stringify(json, null, 2), 'utf-8');
	json.Img = server.expandedData.GetImg(id, client.dirName);
	json.Ico = server.expandedData.GetIco(id, client.dirName);
	res.status(200);
	res.send(json);
}

/**
 * 
 * @param {string} filename 
 * @param {*} newData
 */
function overrideOriginal(filename, newData)
{
	let rawOldData = lib.fs.readFileSync(filename);
	let oldData = JSON.parse(rawOldData);

	console.log("overriding");
	for (let key in oldData)
	{
		console.log(key, newData[key], oldData[key]);
		if (newData[key] != undefined)
			continue ;
		newData[key] = oldData[key];
	}
}

module.exports = {edit};