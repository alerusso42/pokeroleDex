const fs = require("fs");

/**
 * 
 * @param {String | JSON} path path to the json file, or the JSON parsed data 
 * @param {JSON} data new json data
 * @param {boolean} addBool true if you want not existing field to be add
 */
function editJson(path, data, addBool=false)
{
	let oldData;

	if (typeof(path) == "string")
		oldData = getJson(path);
	else
		oldData = path;
	if (path.indexOf(".json") == -1)
		path = path + ".json";
	for (let key in data)
	{
		console.log(`key ${key}, value ${oldData[key]}`);
		if (addBool == false && oldData[key] == undefined)
		{
			console.warn("editJson: adding new data to " + path);
		}
		else
			oldData[key] = data[key];
	}
	if (typeof(path) == "string")
		fs.writeFileSync(path, JSON.stringify(oldData, null, 2), 'utf-8');
}

/**
 * 
 * @param {String} path path to the json file
 * @returns {JSON}
 */
function getJson(path)
{
	let	rawData;
	let	data;

	if (path.indexOf(".json") == -1)
		path = path + ".json";
	rawData = fs.readFileSync(path);
	data = JSON.parse(rawData);
	return (data);
}

module.exports = {editJson, getJson};