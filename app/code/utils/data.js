//@ts-check

import fs from "node:fs";
import {env} from "./macro.js";

console.log(env.VERCEL);//true / false

/** @param {string} path */
function readFile(path)
{
	return (fs.readFileSync(path));
}

/** @param {string} path */
function readDir(path)
{
	return (fs.readdirSync(path));
}

/** @param {string} path */
function createFile(path)
{
	return (fs.openSync(path, 'a+'));
}

/** @param {string} path */
function existFile(path)
{
	return (fs.existsSync(path));
}

/**
 * 
 *  @param {string} path 
 *  @param {*} data
*/
function writeFile(path, data)
{
	return (fs.writeFileSync(path, data));
}

/** @param {string} path */
function rmFile(path)
{
	return (fs.rmSync(path));
}

/** 
 * @param {string} pathOld
 *  @param {string} pathNew 
 **/
function copyFile(pathOld, pathNew)
{
	return (fs.copyFileSync(pathOld, pathNew));
}

export {readFile, readDir, createFile, existFile, writeFile, rmFile, copyFile};
