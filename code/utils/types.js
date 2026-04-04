class Client
{
	constructor(dataName = "", dirName = "", doc = null)
	{
		/** @type {string} */	this.buff = "";

		/** @type {string} */	this.dataName = dataName;

		/** @type {string} */	this.dirName = dirName;
		
		/** @type {number} */	this.dirIndex = 0;
		
		/** @type {Document} */	this.doc = doc;
	}
}

module.exports = {Client};