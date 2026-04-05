const lib = require('./utils/lib.js');
const html = require('./html.js');
const locationSearch = require('./search.js');
const types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
const server = new lib.types.Server("data/trainers/");

lib.app.listen(8080, "0.0.0.0", );

lib.app.get("/", tutorial);

function tutorial(req, res)
{
	const dom = html.getHtml("./html/index.html");
	res.send(dom.serialize());
}

lib.app.get("/keyPressed*splat", (req, res) =>
{
	let url = lib.url.parse(req.url).pathname;
	let arg = lib.utils.urlArg(url);
	if (arg == "")
		return ("");
	console.log("key pressed->" + arg);
	res.send("key pressed->" + arg);
}
);

lib.app.get("/search/*splat", (req, res) =>
{
	let client = new lib.types.Client(server, req, "./html/result.html");
	client.dirName = client.dirName.replace("search", "");
	let contentType = lib.utils.includesOneOf(client.url, "css", "favicon");
	if (contentType != "")
		return html.getMetaData(contentType, res);
	if (client.dirName == "")
		client.dirName = types[0];
	locationSearch.getData(client)
	.then(() => 
	{
		client.doc.getElementById("test").innerHTML += client.buff;
		res.send(client.dom.serialize());
	}
	).catch((err) => 
	{
		write(client, client.dirName + " " + client.dataName + " not found.");
		console.log(err);
		return (res.status(404).end("info: " + err + "\n"));
	}
	);
});
