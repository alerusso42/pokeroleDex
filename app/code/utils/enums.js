// @ts-check

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

module.exports = {enumAuth, enumConds, enumCondBooleans};