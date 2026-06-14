// @ts-check
const fs = require("fs");
const {dataPath, metaDataPath, questDataPath, questImgPath} = require("../macro.js");
const {dataListDirName, dataListPath, protectedDirList} = require("../enums.js");
const {getJson} = require("../json.js");
const { kMaxLength } = require("buffer");

//SECTION - dataList class definition

class dataList
{
	/**
	 * 
	 * @param {boolean} fill
	 */
	constructor(fill)
	{
		/** @type {Array<string>} */	this.pokedex = fillDataListArray(fill, "pokedex");
		/** @type {Array<string>} */	this.nature = fillDataListArray(fill, "nature");
		/** @type {Array<string>} */	this.move = fillDataListArray(fill, "move");
		/** @type {Array<string>} */	this.item = fillDataListArray(fill, "item");
		/** @type {Array<string>} */	this.ability = fillDataListArray(fill, "ability");
		/** @type {Array<string>} */	this.user = fillDataListArray(fill, "user");
		/** @type {Array<string>} */	this.trainer = fillDataListArray(fill, "trainer");
		/** @type {Array<string>} */	this.pokemon = fillDataListArray(fill, "pokemon");
		
		this.Print = print.bind(this);
		this.GetPath = getPath;
		this.GetDirName = getDirName;
		this.GetFilename = getfilename;
	}
}

//SECTION - dataList class methods/utils

/**
 * 
 * @this {*}
 */
function print()
{
	if (!this)
		return ;
	for (let ar in this)
	{
		console.log("\x1b[32m", ar, "print:\x1b[0m");
		// @ts-ignore
		console.log(this[ar]);
	}
}

/** @param {string} dataName */
function getPath(dataName)
{
	// @ts-ignore
	return (dataListPath[dataName]);
}

/** @param {string} dirName */
function getDirName(dirName)
{
	// @ts-ignore
	return (dataListDirName[dirName]);
}

/**
 * 
 * @param {string} dataName 
 * @param {string} dirName 
 * @param {string} root 
 * @param {string} ext 
 * @param {boolean} checkExistBool
 */
function getfilename(dataName, dirName="", root=questDataPath, ext="json", checkExistBool=true)
{
	let	filename;

	if (!dataName)
		throw ("getFilename: dataName is null");
	if (ext != null && ext.at(0) == ".")
		ext = ext.slice(1, ext.length);
	if (ext != null)
		filename = root + dirName + "/" + dataName + `.${ext}`;
	else
		filename = root + dirName + "/" + dataName;
	if (checkExistBool == true && fs.existsSync(filename) == false)
		throw ("getFilename: cannot find " + filename);
	return (filename);
}

/**
 * 
 * @param {boolean} fill
 * @param {string} type 
 * @returns {Array<string>} the array filled with all files in that directory
 */
function fillDataListArray(fill, type)
{
	// @ts-ignore
	let path = dataListPath[type];
	let array = new Array();

	if (fill == false)
		return (array);
	for (let file of fs.readdirSync(path))
	{
		if (file[0] == ".")
			continue ;
		file = file.replace(".json", "");
		array.push(file);
	}
	return (array);
}

//SECTION - expanded data list

/**
 * @typedef {Object} ExpPrototype
 * @property {string} Id id of the data
 * @property {string} filename
 * @property {string} Img Img extension or url
 * @property {string} Ico Ico extension or url
 * @property {string} Category category of data
 */

class expandedDataList
{
	/** @param {dataList} list */
	constructor(list)
	{
		this.pokedex = fillDataListExpanded(list, "pokedex", dataPath);
		this.nature = fillDataListExpanded(list, "nature", dataPath);
		this.move = fillDataListExpanded(list, "move", dataPath);
		this.item = fillDataListExpanded(list, "item", dataPath);
		this.ability = fillDataListExpanded(list, "ability", dataPath);
		this.user = fillDataListExpanded(list, "user");
		this.trainer = fillDataListExpanded(list, "trainer");
		this.pokemon = fillDataListExpanded(list, "pokemon");

		this.Print = printExp.bind(this);
		this.GetPath = getPath;
		this.GetDirName = getDirName;
		this.GetFilename = getfilename;
		this.GetData = getData;
		this.SetId = setId;
		this.GetImg = getImg;
		this.SetImg = setImg;
		this.GetIco = getIco;
		this.SetIco = setIco;
	}
	/** @param {string} id*/
	GetRealName(id){return (getRealName(id));}
}

/**
 * 
 * @param {dataList} list the lists of data divided by directories
 * @param {string} type the directory name 
 * @returns {Map<string, ExpPrototype>}
 */
function fillDataListExpanded(list, type, root=questDataPath)
{
	/**  @type {ExpPrototype}*/let	expData;
	let	arrayFiles;
	let	mapExpData;
	let	filename;
	let	json;

	mapExpData = new Map();
	// @ts-ignore
	arrayFiles = list[type];
	if (!arrayFiles)
		throw ("fillDataListExpanded: cannot init type " + type);
	for (let data of arrayFiles)
	{
		// @ts-ignore
		expData = {};
		filename = getfilename(data, getDirName(type), root);
		json = getJson(filename);
		expData.filename = filename;
		if (json.Category)
			expData.Category = json.category;
		expData.Img = json.Img;
		expData.Ico = json.Ico;
		expData.Id = data;
		mapExpData.set(data, expData);
	}
	return (mapExpData);
}

/**
 * 
 * @this {*}
 */
function printExp()
{
	if (!this)
		return ;
	for (let ar in this)
	{
		console.log("\x1b[32m", ar, "print:\x1b[0m");
		// @ts-ignore
		console.log(this[ar]);
	}
}

// this.GetId = getId;
// 		this.GetImg = getImg;
// 		this.GetIco = getIco;
// 		this.SetImg = setImg;
// 		this.SetIco = setIco;

/**
 * 
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @returns {ExpPrototype}
 */
function getData(id, dir)
{
	let	data;

	//@ts-ignore
	if (!this[dir])
		throw (`expandedDataList, getId: dir ${dir} invalid`);
	//@ts-ignore
	data = this[dir].get(id);
	if (!data)
		throw (`expandedDataList, getId: data ${dir}/${id} invalid`);
	return (data);
}

/**
 * 
 * @param {string} id 
 */
function getRealName(id)
{
	let	underscoreIndex;

	underscoreIndex = id.lastIndexOf("_");
	if (underscoreIndex == -1)
		return (id);
	else
		return (id.slice(0, underscoreIndex));
}

/**
 * 
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @param {string} username
 */
function setId(id, dir, username)
{
	let	data;
	/** @type {ExpPrototype} */let	newData;
	let	idNumber;
	let	underscoreIndex;

	data = this.GetData(id, dir);
	underscoreIndex = username.lastIndexOf("_");
	if (underscoreIndex != -1)
		idNumber = username.slice(underscoreIndex);
	else
		idNumber = "";
	username = username + idNumber;
	newData = 
	{
		Id: username,
		Category: data.Category,
		filename: data.filename,
		Ico: data.Ico,
		Img: data.Img
	};//@ts-ignore
	this[dir].set(username, newData);
	this.SetImg(username, dir, newData.Img, id);
	this.SetIco(username, dir, newData.Ico, id);
	if (username != id)//@ts-ignore
		this[dir].delete(id);
	return (id);
}

/**
 * 
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @returns {string}
 */
function getImg(id, dir)
{
	let	img;

	img = this.GetData(id, dir).Img;
	if (img.at(0) != ".")
		return (img);
	else
		return (`/media/pictures/${dir}/${id}_Img${img}`);
}

/**
 * 
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @param {string} newData 
 * @param {string} oldId
 */
function setImg(id, dir, newData, oldId="")
{
	let	data;
	let	filepath;
	let	oldpath;
	let	existBool;

	filepath = this.GetFilename(id, dir, questImgPath, newData, false);
	data = this.GetData(id, dir);
	if (!oldId)
		oldpath = "";
	else
	{
		oldpath = this.GetFilename(oldId, dir, questImgPath, data.Img, false);
		oldpath = oldpath.replace(`${data.Img}`, `_Img${data.Img}`);
		filepath = filepath.replace(newData, `_Img${data.Img}`);
	}
	existBool = fs.existsSync(oldpath);
	data.Img = newData;
	if (existBool)
	{
		existBool = fs.existsSync(filepath);
		if (existBool == false && newData.at(0) == ".")
			fs.copyFileSync(oldpath, filepath);
		if (oldpath != filepath)
			fs.rmSync(oldpath);
	}
}

/**
 * returns a href to the ico
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @returns {string}
 */
function getIco(id, dir)
{
	let	ico;

	ico = this.GetData(id, dir).Ico;
	if (!ico)
		return ("");
	if (ico.at(0) != ".")
		return (ico);
	else
		return (`/media/pictures/${dir}/${id}_Ico${ico}`);
}

/**
 * 
 * @this {expandedDataList}
 * @param {string} id 
 * @param {string} dir 
 * @param {string} newData
 * @param {string} oldId
 */
function setIco(id, dir, newData, oldId="")
{
	let	data;
	let	filepath;
	let	oldpath;
	let	existBool;

	filepath = this.GetFilename(id, dir, questImgPath, newData, false);
	data = this.GetData(id, dir);
	if (!oldId)
		oldpath = "";
	else
	{
		oldpath = this.GetFilename(oldId, dir, questImgPath, data.Ico, false);
		oldpath = oldpath.replace(`${data.Ico}`, `_Ico${data.Ico}`);
		filepath = filepath.replace(newData, `_Ico${data.Ico}`);
	}
	existBool = fs.existsSync(oldpath);
	data.Ico = newData;
	if (existBool)
	{
		existBool = fs.existsSync(filepath);
		if (existBool == false && newData.at(0) == ".")
			fs.copyFileSync(oldpath, filepath);
		if (oldpath != filepath)
			fs.rmSync(oldpath);
	}
}

module.exports = {dataList, expandedDataList, dataListPath};