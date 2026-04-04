const { JSDOM } = require("jsdom");
const fs = require("fs");
const url = require("url");
const net = require('./net.js');

function getHtml (path)
{
	const fd = fs.readFileSync(path);
	const dom = new JSDOM(fd);
	return (dom);
}

function dataNormalize(dataName)
{
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

class Client
{
	/**
	 * 
	 * @param {Request} req 
	 * @param {String} res_html 
	 */
	constructor(req, res_html)
	{
		/** @type {JSDOM} */	this.dom = getHtml(res_html);

		/** @type {Document} */	this.doc = this.dom.window.document;

		/** @type {string} */	this.buff = "";

		/** @type {string} */	this.url = url.parse(req.url).pathname;

		/** @type {string} */	this.dataName = net.urlArg(this.url).replaceAll("/", "");
								this.dataName = dataNormalize(this.dataName);

		/** @type {string} */	this.dirName = net.urlDir(this.url).replaceAll("/", "");
		
		/** @type {number} */	this.dirIndex = 0;

		console.log("Client searching for \"" + this.dataName + "\"")
	}
}

module.exports = {Client};