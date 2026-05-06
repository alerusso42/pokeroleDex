/**
 * checks if one on the strings is present in the source string
 * @param {String} str  the source string 
 * @param {String/Array} ... one or more string to compare, OR an Array
 * @returns {string} the first string found if a match exists, else ""
 */
function includesOneOf(str)
{
	let list = arguments;
	let i = 0;

	if (list[1] == "")
		return ("");
	if (typeof(list[1]) != "string")
		list = list[1];
	else
		i = 1;
    for (; i != list.length; i++)
    {
        if (str.includes(list[i]) == true)
            return (list[i]);
    }
    return ("");
}

/**
 * Mega Charizard X -> charizard-x-mega-form
 * @param {string} name 
 */
function pokemonToSnakeCase(name)
{
	if (name.includes("mega ") == true && name.includes("drain") == false)
	{
		name = name.replace("mega-", "");
		name = name + "-mega-form";
	}
	name = name.replace(" (", "-").replace(")", "");
	name = name.toLowerCase().replaceAll(" ", "-");
	return (name);
}

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
	if (dataName == "Porygon-z")
		dataName = "Porygon-Z";
	return (dataName);
}

module.exports = {includesOneOf, pokemonToSnakeCase, dataNormalize};