function urlArg(url)
{
	if (url.includes("/") == false)
		return ("");
	url = url.replaceAll("%20", " ");
	return (url.substring(url.lastIndexOf("/"), url.length));
}

function urlDir(url)
{
	if (url.includes("/") == false)
		return ("");
	return (url.substring(0, url.lastIndexOf("/") + 1));
}

function urlNormalize(url)
{
	return (url.toLowerCase().replaceAll(" ", "-").replaceAll("(", "").replaceAll(")", ""));
}

async function fetchBinary(url)
{
	try 
	{
		let data = await fetch(url);
		let buffer = Buffer.from(await data.arrayBuffer());
		return (buffer);
	}
	catch (err)
	{
		console.log("fetchBinary exception:" + err);
		return ("fetchBinary exception:" + err);
	}
}

async function fetchText(url)
{
	try 
	{
		let data = await fetch(url);
		let buffer = Buffer.from(await data.text());
		return (buffer);
	}
	catch (err)
	{
		console.log("fetchBinary exception:" + err);
		return ("fetchText exception:" + err);
	}
}

module.exports = {urlArg, urlDir, urlNormalize, fetchBinary, fetchText}