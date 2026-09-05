import { readFile } from "./utils/data.js";
import * as lib from "./utils/lib.js";
const imgBox = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/BoxSprites/";


/**
 * fills href id data-img with the resource to get
 * @param {Document} doc 
 * @param {String} path 
 * @param {String} name 
 */
function loadImgUrl(doc, path, name)
{
	let imgTag = doc.getElementById("data-img");
	imgTag.src = path;
	if (name != null && name != "")
		imgTag.src += lib.utils.urlNormalize(name) + ".png";
	imgTag.alt = name;
}

/**
 * @description handles static files serving
 * @param {String} contentType  
 * @param {Response} res 
 */
async function getMetaData(contentType, res)
{
	if (contentType.includes("png") == true)
		return (res.send(""));
	if (contentType == "css")
		return (res.send(lib.fs.readFileSync("html/pokemon.css")));
	let url = imgBox + "rayquaza.png";
	let binary = await lib.utils.fetchBinary(url);
	res.send(binary);
}

function getHtml(path)
{
	const fd = lib.fs.readFileSync(path);
	const dom = new lib.JSDOM(fd);
	return (dom);
}

export {loadImgUrl, getMetaData, getHtml};
