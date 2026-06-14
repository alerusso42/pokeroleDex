// @ts-check

const {dataPath, metaDataPath, questDataPath, questImgPath} = require("./macro.js");

/** @enum {*} */
const enumAuth = 
{
	"UNKNOWN" : 0,
	"LOGIN" : 1,
	"WRONG_LOGIN" : 1,
	"CORRECT_LOGIN" : 2,
	"ADMIN" : 3,
};

const enumConds = 
{
	"EQUAL" : "EQUAL",
	"EQUAL_GREAT" : "EQUAL_GREAT",
	"EQUAL_SMALL" : "EQUAL_SMALL",
	"GREAT" : "EQUAL_GREAT",
	"SMALL" : "EQUAL_SMALL",
	"HAS" : "HAS"
};

const enumCondBooleans = 
{
	"OR" : "OR",
	"||" : "OR",
	"AND" : "AND",
	"&&" : "AND"
};

/** @enum {string} */
const dataListDirName = 
{
	"pokedex" : "Pokemon",
	"nature" : "Nature",
	"move" : "Move",
	"item" : "Item",
	"ability" : "Ability",
	"user" : "user",
	"trainer" : "trainer",
	"pokemon" : "pokemon"
};

/** @enum {string} */
const dataListPath = 
{
	"pokedex" : dataPath + "Pokemon/",
	"nature" : dataPath + "Nature/",
	"move" : dataPath + "Move/",
	"item" : dataPath + "Item/",
	"ability" : dataPath + "Ability/",
	"user" : questDataPath + "user/",
	"trainer" : questDataPath + "trainer/",
	"pokemon" : questDataPath + "pokemon/",
	"category": questDataPath + "category/"
};

const protectedDirList = [dataListDirName.user, dataListDirName.trainer, dataListDirName.pokemon];


module.exports = {enumAuth, enumConds, enumCondBooleans, dataListDirName, dataListPath, protectedDirList};