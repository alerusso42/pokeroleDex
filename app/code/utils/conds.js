//@ts-check
const {enumConds, enumCondBooleans} = require("./enums.js");
const { dataNormalize } = require("./string.js");

/** @typedef {import("../../metadata/cond.json")} Cond*/
/** @typedef {Array<Cond>} Conds*/
/** @typedef {import('./classes/DataList.js').ExpPrototype} ExpData*/
/** @typedef {Set<ExpData>} ExpDataSet*/

/**
 * //SECTION - cond object
 * ## why use it
 * getting json data from data, filtered by conditions.
 * an Array with valid data will be returned back
 * ## how to pass a cond
 * #### example of a object to get conditionally
 * ```json
 * {
    "Species": "Eevee",
    "Name": "distruttore brutale",
    "Trainer": "Bruno",
	"Category": "Starter",
	"Img": "",
	"Ico": "",
    "Type1": "Normal",
    "HP": { "current": 3, "max": 7 }
	    "Evolutions": [
        {
            "To": "Vaporeon",
            "Kind": "Stone",
            "Item": "Water Stone"
        },
        {
            "To": "Jolteon",
            "Kind": "Stone",
            "Item": "Thunder Stone"
        }
	}
 * ```
 * #### structure of a cond json
 * ```json
 * {
 * 	"conds": 
 * [
 * {
	"field": "Species",
	"cond": "EQUAL",
	"value": "Eevee",
	"expect": false,
	"next": "AND"
	}
 * {//this returns always false, because BerriesEaten is undefined
	"field": "BerriesEaten",
	"cond": "EQUAL_SMALL",
	"value": "42",
	"expect": true,
	"next": "OR"
	}
 * {
	"field": "HP.max",
	"cond": "GREAT",
	"value": "2",
	"expect": true,
	"next": "AND"
	}
 * {
	"field": "Evolutions.to",
	"cond": "GREAT",
	"value": "Jolteon",
	"expect": true,
	"next": "OR"
	}
 * {
	"field": "Type2",
	"cond": "HAS",
	"value": "",
	"expect": true,
	"next": ""
	}
	]
}
 * ```
 * #### what happens here
 * 1)	eevee field "Species" matches, but expect is false.
 * 		conds are skipped until a OR is found.
 * 2)	field HP.max is greater than two. Next is &&, so we go on.
 * 3)	in the Evolutions array, a field with the value "Jolteon" is found.
 * 		next is OR, so we return true without evaluating further.
 * #### other info
 * enums.js file
 */

/**
 * 
 * @param {{}} data 
 * @param {Conds} conds
 */
function condCheck(data, conds)
{
	let	result;
	let	next;
	let	currBoolean;
	let	searchORBool;

	currBoolean = enumCondBooleans.OR;
	searchORBool = false;
	for (const cond of conds)
	{
		//@ts-ignore
		next = enumCondBooleans[cond.next];
		if (searchORBool == true)
		{
			if (currBoolean != enumCondBooleans.OR)
			{
				currBoolean = next;
				continue ;
			}
			searchORBool = false;
		}
		if (!next)
			next = enumCondBooleans.OR;
		result = evalCond(data, cond);
		currBoolean = next;
		if (result == true && next == enumCondBooleans.OR)
			return (true);
		else if (result == true)
			continue ;
		else if (result == false && next == enumCondBooleans.OR)
			continue ;
		searchORBool = true;
	}
	return (false);
}

/**
 * 
 * @param {Conds} conds
 */
function condSanifier(conds)
{
	for (const cond of conds)
	{
		if (cond.cond == undefined || cond.field == undefined || 
			cond.value == undefined || cond.expect == undefined)
		{
			return (console.log("condSanify: missing: " + cond), false);
		}
		cond.value = cond.value.toString();
		cond.value = dataNormalize(cond.value);
		if (cond.expect != false && cond.expect != true)
			return (console.log("condSanify: bad expect: " + cond), false);
	}
	return (true);
}

/**
 * 
 * @param {{}} data 
 * @param {Cond} cond
 */
function evalCond(data, cond)
{
	let	metadata;
	let	field;

	metadata = {counter: 0, end: false};
	field = resolveField(data, cond.field, metadata);
	if (field != undefined && evalCondOne(field, cond) == true)
		return (true);
	while (metadata.end == false)
	{
		metadata.counter += 1;
		field = resolveField(data, cond.field, metadata);
		if (field != undefined && evalCondOne(field, cond) == true)
			return (true);
	}
	return (false);
}

/**
 * 
 * @param {string} field
 * @param {Cond} cond
 */
function evalCondOne(field, cond)
{
	let	value;

	if (cond.cond != enumConds.HAS && field == undefined)
		return (false);
	field = dataNormalize(field);
	value = cond.value;
	if (Number.isInteger(field) && Number.isInteger(value))
	{
		let {numField, numValue} = numericHandler(field, value);
		field = numField;
		value = numValue;
	}
	switch (cond.cond)
	{
		case (enumConds.EQUAL):
			return ((field == value) == cond.expect);
		case (enumConds.EQUAL_GREAT):
			return ((field >= value) == cond.expect);
		case (enumConds.EQUAL_SMALL):
			return ((field <= value) == cond.expect);
		case (enumConds.GREAT):
			return ((field > value) == cond.expect);
		case (enumConds.SMALL):
			return ((field < value) == cond.expect);
		case (enumConds.HAS):
			return ((field != undefined) == cond.expect);
		default:
			console.error("invalid cond: ", cond);
			return (false);
	}
	throw ("evalCond: you should not be here");
}

/**
 * returns a field from a json object
 * in case of Array, it scrolls them until a valid field is found
 * you can pass an object to iterate the arrays and skipping matches
 * ```ts
 * {
 * 		counter: number,//number of fields to skip
 * 		end: boolean//set as true if there is nothing else to search
 * }
 * ```
 * @param {{}} data 
 * @param {string} field 
 * @param {{counter: number, end: boolean}} skip
 * @returns {string | undefined}
 */
function resolveField(data, field, skip={counter: 0, end: false})
{
	let	index;
	let	currKey;
	let	input;
	let	foundField;

	input = field;
	index = input.indexOf(".");
	skip.end = true;
	while (input.length != 0)
	{
		if (Array.isArray(data) && input)
		{
			foundField = undefined;
			for (const val of data)
			{
				foundField = resolveField(val, input, skip);
				skip.end = false;
				if (foundField != undefined)
				{
					if (skip.counter == 0)
						break ;
					foundField = undefined;
					skip.counter -= 1;
				}
			}
			if (foundField != undefined)
			{
				data = foundField;
				break ;
			}
			skip.end = true;
			return (undefined);
		}
		else if (Array.isArray(data))
			break ;
		if (index != -1)
		{
			currKey = input.slice(0, index);
			input = input.slice(index + 1);
		}
		else
		{
			currKey = input;
			input = "";
		}//@ts-ignore
		data = data[currKey];
		if (data == undefined || data == null)
		{
			skip.end = true;
			return (undefined);
		}
		index = input.indexOf(".");
	}
	if (typeof(data) == "string")
		return (data);
	return (JSON.stringify(data, null, 0));
}

/**
 * normalize two strings containing integers 
 * @param {string} field
 * @param {string} value
 */
function numericHandler(field, value)
{
	if (field.length > value.length)
		return ({numField: "a", numValue: "0"});
	else if (field.length < value.length)
		return ({numField: "0", numValue: "a"});
	return ({numField: field, numValue: value});
}

module.exports = {condCheck, condSanifier, resolveField};