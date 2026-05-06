// @ts-check
const JSDOM = require("jsdom").JSDOM;
const fs = require("fs");
const url = require("url");
const {Server} = require("./Server");
const net = require('../net.js');
const stringUtils = require('../string.js');
const {enumAuth} = require("../enums.js");

/** @typedef {import("express").Request} ExpressRequest */
/** @typedef {typeof import("../../../../data/questData/template/user.json")} User */

//SECTION - Client class definition

class Client
{
	/**
	 * 
	 * @param {Server} server 
	 * @param {ExpressRequest} req 
	 * @param {String | null} res_html 
	 */
	constructor(server, req, res_html=null)
	{
		if (res_html != null)
		{
			/** @type {JSDOM} */	this.dom = getHtml(res_html);
	
			// @ts-ignore
			/** @type {Document} */	this.doc = this.dom.window.document;
		}
		/** @type {ExpressRequest} */	this.req = req;

		/** @type {string} */	this.body = req.body;

		/** @type {string} */	this.buff = "";

								let	getUrl = url.parse(req.url).pathname;
								if (getUrl == null)
									throw ("url does not exist!");
		/** @type {string} */	this.url = getUrl;

		/** @type {User | null} */		this.user = getUser(server, req);

		/** @type {string} */	this.dataName = net.urlArg(this.url).replaceAll("/", "");
								this.dataName = dataNormalize(this.dataName);

		/** @type {string} */	this.dirName = net.urlDir(this.url).replaceAll("/", "");
		
		/** @type {number} */	this.dirIndex = 0;

		/** @type {boolean} */	this.isAdmin = isAdmin(req, this.user);

		/** @type {boolean} */	this.isLogged = this.user != null;

		/** @type {number} */	this.authLevel = enumAuth.UNKNOWN;

		if (this.isAdmin == true && this.isLogged == true && this.user)
			console.log("Admin", this.user.Name, "searching for \"" + this.dataName + "\"");
		else if (this.isAdmin == true)
			console.log("Admin searching for \"" + this.dataName + "\"");
		else if (this.isLogged && this.user)
			console.log("Client", this.user.Name, "searching for \"" + this.dataName + "\"");
		else
			console.log("Unrecognized Client searching for \"" + this.dataName + "\"");
	}
}

//SECTION - Client class methods/utils

/**
 * 
 * @param {string} path 
 * @returns 
 */
function getHtml (path)
{
	const fd = fs.readFileSync(path);
	const dom = new JSDOM(fd);
	return (dom);
}

/**
 * 
 * @param {string} dataName 
 * @returns 
 */
function dataNormalize(dataName)
{
	if (dataName == "")
		return ("");
	dataName = dataName[0].toUpperCase() + dataName.substring(1, dataName.length);
	if (dataName.startsWith("Mega ") == true && dataName.includes("drain") == false)
		dataName = dataNormalize(dataName.substring(5, dataName.length) + " (Mega Form)");
	let i = 0;
	while (i != dataName.length)
	{
		if (dataName[i] == ' ' || dataName[i] == '(')
			dataName = dataName.substring(0, i + 1) + dataName[i + 1].toUpperCase() + dataName.substring(i + 2, dataName.length);
		++i;
	}
	return (dataName);
}

/**
 * 
 * @param {Server} server 
 * @param {ExpressRequest} req 
 * @returns {User | null} 
 */
function getUser(server, req)
{
	let cookie = req.headers.cookie;
	if (cookie == undefined)
		return (null);
	cookie = cookie.replace("userId=", "");
	let user = server.userMap.get(parseInt(cookie));
	if (user == undefined)
	{
		console.warn("illegal cookie", cookie);
		return (null);
	}
	return (user);
}

/**
 * 
 * @param {ExpressRequest} req 
 * @param {User | null} user 
 */
function isAdmin(req, user)
{
	let	ip;

	ip = req.ip;
	if (!ip)
		throw ("missing ip for client");
	if (stringUtils.includesOneOf(ip, "127.0.0.1", "localhost", "::1") != "" || 
		(user != null && user.IsAdmin == true))
	{
		return (true);
	}
	return (false);
}

module.exports = {Client};