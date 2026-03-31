function urlArg(url)
{
	if (url.includes("/") == false)
		return ("");
	return (url.substring(url.lastIndexOf("/"), url.length));
}

function urlDir(url)
{
	if (url.includes("/") == false)
		return ("");
	return (url.substring(0, url.lastIndexOf("/") + 1));
}

module.exports = {urlArg, urlDir}