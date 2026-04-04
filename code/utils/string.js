/**
 * checks if one on the strings is present in the source string
 * @param {String} str  the source string 
 * @param {String/Array} ... one or more string to compare, OR an Array
 * @returns {number} the first string found if a match exists, else ""
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

module.exports = {includesOneOf};