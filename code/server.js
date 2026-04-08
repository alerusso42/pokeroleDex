const lib = require('./utils/lib.js');
const html = require('./html.js');
const locationSearch = require('./search.js');
const locationLogin = require('./login.js');
const types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
const server = new lib.types.Server();

lib.app.listen(8080, "0.0.0.0");
// interpreta il body
lib.app.use(lib.express.text());

lib.app.use("/html", lib.express.static("html/"));

lib.app.get("/", tutorial);

function tutorial(req, res)
{
	const dom = html.getHtml("./html/index.html");
	res.send(dom.serialize());
}

lib.app.get("/keyPressed/search*splat", (req, res) =>
{
	let url = lib.url.parse(req.url).pathname;
	let arg = lib.utils.urlArg(url);
	if (arg.length <= 1)
		return (res.end(""));
	arg = arg.slice(1, arg.length);// elimina lo /
	let match = locationSearch.searchByKey(arg, server.data);
	for (let data in match)
	{
		if (match[data].length == 0)
			continue ;
		res.write(`<h3 class="a.badge">${data}</h3>`);
		for (let i = 0; i != match[data].length; i++)
		{
			res.write(match[data][i]);
		}
	}
	res.end();
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

lib.app.get("/auth", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/login.html");
	res.send(client.dom.serialize());
});

lib.app.post("/login/:user", async (req, res) => 
{
	return (locationLogin.login(server, req, res, true));
});

lib.app.post("/register/:user", async (req, res) => 
{
	return (locationLogin.login(server, req, res, false));
});

lib.app.get("/trainers", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/autoindex.html");
	if (client.isLogged == false)
		res.redirect("/loginpage");
	res.send("autoindex di ogni trainer " + client);
});

lib.app.get("/trainers/:trName/", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/autoindex.html");
	if (client.isLogged == false)
		res.redirect("/loginpage");
	res.send("pokemon posseduti da " + client.req.params.trName);
});

lib.app.get("/trainers/:trName/:pkName", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon.html");
	if (client.isLogged == false)
		res.redirect("/loginpage");
	res.send("dati pokemon " + client.req.params.pkName + " di allenatore " + client.req.params.trName);
});
