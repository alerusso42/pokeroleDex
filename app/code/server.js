const lib = require('./utils/lib.js');
const html = require('./html.js');
const locationSearch = require('./search.js');
const locationLogin = require('./login.js');
const locationAutoIndex = require('./autoindex.js');
const {view} = require('./view.js');
const {edit} = require('./edit.js');
const {create} = require('./create.js');
const { editTrainer } = require('./trainer.js');
const { enumAuth } = require('./utils/enums.js');
const { questImgPath } = require('./utils/macro.js');
const { editJson } = require('./utils/json.js');
const types = new Array("Pokemon", "Move", "Nature", "Ability", "Item");
const server = new lib.types.Server();

// interpreta il body
lib.app.use(lib.express.text());
lib.app.use(lib.express.raw({ type: 'application/octet-stream', limit: '5mb' }));
lib.app.use(lib.express.json());
lib.app.use(lib.express.urlencoded({ extended: true }));

lib.app.get("/html/error/:page", (req, res) => 
{
	
	try
	{
		let		page = req.params.page;
		let		path = "./html/error/";
		let		dom;

		if (!page.endsWith(".html"))
			page += ".html";
		path += page;
		console.log(path);
		dom = html.getHtml(path);
		if (req.query.msg != null)
			dom.window.document.getElementById("msg").innerHTML = `<h3>${req.query.msg}</h3>`;
		res.send(dom.serialize());
	}
	catch(err)
	{
		console.error(err);
		res.send(err);
	}
});

lib.app.use("/html", lib.express.static("html/"));
// lib.app.use("/html/error", lib.express.static("html/error/"));

lib.app.get("/", (req, res) => 
{
	const dom = html.getHtml("./html/home.html");
	res.send(dom.serialize());
});

lib.app.get("/keyPressed/search*splat", (req, res) => 
{
	let url = lib.url.parse(req.url).pathname;
	let arg = lib.utils.urlArg(url);

	if (arg.length <= 1)
		return (res.end(""));
	arg = arg.slice(1, arg.length);// elimina lo /
	let match = locationSearch.searchByKey(arg, server.data, req.query.include);
	for (let category in match)
	{
		if (match[category].length == 0)
			continue ;
		let path = server.data.GetDirName(`${category}`);
		res.write(`<div class="search-category-title">${category}</div>`);
		res.write(`<div class="search-results-list">`);
		for (let name of match[category])
		{
			let img = lib.utils.pokemonToSnakeCase(name) + ".png";
				res.write(`<a href="/search/${path}/${name}" class="search-item">`);
				if (category == "pokedex")
				{
					res.write(`<img src="https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/${img}" class="item-icon">`);
				}
				res.write(`
					<span class="item-name">${name}</span>
					<span class="item-type-label">${category}</span>
				</a>
				`);
		}
		res.write(`</div>`);
	}
	res.end();
}
);

lib.app.post("/keyPressed/data/:dir/:name/:field", (req, res) => 
{
	let client = new lib.types.Client(server, req);
	let match;
	let	field;

	if (!req.body)
		res.status(400).send("missing body");
	client.dataName = req.params.name;
	client.dirName = req.params.dir;
	field = req.params.field;
	match = locationSearch.searchByDataExpanded(server, client, field, true);
	res.end();
}
);

lib.app.post("/keyPressed/autoindex/:dir{/:keys}", (req, res) => 
{
	let client = new lib.types.Client(server, req);
	let match;
	let	field;

	debugger;
	if (!req.body)
		res.status(400).send("missing body");
	client.dirName = req.params.dir;
	field = req.params.field;
	match = locationSearch.searchByDirExpanded(server, client, field, true);
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

lib.app.get("/searchAdvanced/", (req, res) =>
{
	let client = new lib.types.Client(server, req, "./html/searchAdvanced.html");

	res.send(client.dom.serialize());
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

lib.app.get("/user/", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/autoindex.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (locationAutoIndex.autoIndex(server, client, res));
});

lib.app.get("/trainer/", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/autoindex.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (locationAutoIndex.autoIndex(server, client, res));
});

lib.app.get("/pokemon/", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/autoindex.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (locationAutoIndex.autoIndex(server, client, res));
});

lib.app.get("/user/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/user/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/trainer/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/trainer/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/pokemon/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/edit/user/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/user/edit.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/edit/trainer/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/trainer/edit.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/edit/pokemon/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/edit.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (res.send(client.dom.serialize()));
});

lib.app.get("/api/user/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/user/view.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (view(server, client, res));
});

lib.app.get("/api/trainer/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/trainer/view.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (view(server, client, res));
});

lib.app.post("/api/user/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req);
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (edit(server, client, res));
});

lib.app.post("/api/trainer/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/trainer/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (editTrainer(server, client, res));
});

lib.app.get("/api/pokemon/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");
	if (locationLogin.loginCheck(server, client, res) == 1)
		return ;
	return (view(server, client, res));
});

lib.app.post("/api/pokemon/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (edit(server, client, res));
});

lib.app.post("/api/create/:type/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");

	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	return (create(server, client, res));
});

lib.app.post("/api/delete/:type/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	console.log("delete");
});

lib.app.get("/api/info/:name", (req, res) => 
{
	let client = new lib.types.Client(server, req, "./html/pokemon/view.html");
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	let name = req.params.name;
	if (name == "id")
	{
		server.metaData.id++;
		server.metaData.Update("id", server.metaData.id);
	}
	res.send(JSON.stringify({name: server.metaData[name]}));
});

lib.app.get("/api/userInfo", (req, res) =>
{
	let client;
	let	userInfo;
	
	client = new lib.types.Client(server, req);
	locationLogin.loginCheck(server, client, res);
	userInfo = client.user;
	if (userInfo == null)
	{
		if (client.isAdmin == true)
			return (res.json({Name: "nameless", Level: enumAuth.ADMIN}));
		return (res.end());
	}
	userInfo.File = "SECRET";
	userInfo.Password = "SECRET";
	userInfo.Level = client.authLevel;
	res.json(userInfo);
});

lib.app.post("/api/upload/:type/:id", (req, res) =>
{
	let client;
	let	buffer;
	let	ext;
	let	filename;
	let	filetype;
	let	update;

	client = new lib.types.Client(server, req);
	if (locationLogin.loginCheck(server, client, res, true) == 1)
		return ;
	if (req.params.id.indexOf("..") != -1 || req.params.type.indexOf("..") != -1)
		return (res.status(400).end("upload: filename with .. invalid"));
	ext = req.query.ext;
	filetype = req.query.filetype;
	update = {};
	if (!ext || !filetype)
	{
		console.warn("missing extension or filetype in upload");
		return (res.status(400).end("missing extension in upload"));
	}
	if (filetype != "Img" && filetype != "Ico")
		return (res.status(400).end("filetype must be Ico or Img"));
	buffer = Buffer.from(client.body);
	if (!buffer)
		throw ("Buffer in upload failed");
	filename = server.data.GetFilename(req.params.id, req.params.type, questImgPath, ext, false);
	if (!filename)
		return (res.status(400).end("upload: cannot get filename"));
	filename = filename.replace(`.${ext}`, `_${filetype}.${ext}`);
	lib.fs.writeFileSync(filename, buffer);
	update[filetype] = `.${ext}`;
	editJson(server.data.GetFilename(req.params.id, "trainer"), update, true);
	server.expandedData[req.params.type].get(req.params.id)[filetype] = `.${ext}`;
	// console.log(server.expandedData[req.params.type].get(req.params.id)[filetype]);
	return (res.status(200).end());
});

lib.app.get("/media/pictures/:type/:filename", (req, res) =>
{
	let	client;
	let	filename;
	let	buffer;

	client = new lib.types.Client(server, req);
	if (req.params.type.indexOf("..") != -1)
	{
		res.status(400).end("get requests with .. are forbidden");
		return ;
	}
	filename = server.data.GetFilename(client.dataName, req.params.type, questImgPath, null, true);
	buffer = lib.fs.readFileSync(filename);
	buffer = Buffer.from(buffer);
	res.send(buffer);
});

lib.app.get("/admin/", (req, res) => 
{
	let	client;

	client = new lib.types.Client(server, req, "./html/admin.html");
	if (client.isAdmin == false)
	{
		res.status(401);
		res.end(getHtml("./html/error/401.html").serialize());
		return (1);
	}
	res.send(client.dom.serialize());
});

lib.app.get("/*splat", (req, res) =>
{
	let client = new lib.types.Client(server, req, "./html/error/404.html");
	res.status(404);
	res.end(client.dom.serialize());
});

lib.app.use((err, req, res, next) =>
{
	if (!err || !err.message || !err.stack)
	{
		console.error("ERROR\n");
		res.redirect("/html/error/500.html");
		return ;
	}
	console.error("ERROR\n", err.message, "\nSTACK");
	console.error(err.stack);
	res.redirect("/html/error/500.html?msg=" + err.message + "<br>" + err.stack);
});

lib.app.listen(8080, "0.0.0.0");
