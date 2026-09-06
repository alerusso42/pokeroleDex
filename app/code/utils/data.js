//@ts-check

import fs from "node:fs";
import { put, del, list } from "@vercel/blob";
import { env } from "./macro.js";

console.log(env.VERCEL);//true / false

/** @param {string} path */
async function readFile(path)
{
	if (fs.existsSync(path))
		return (fs.readFileSync(path));
	const blobPath = cleanPath(path);
	const { blobs } = await list({ prefix: blobPath });
	const targetBlob = blobs.find((b) => b.pathname === blobPath);
	if (!targetBlob) 
	{
		throw new Error(`readFile (Blob): File non trovato -> ${blobPath}`);
	}
	const response = await fetch(targetBlob.url);
	if (!response.ok)
	{
		throw new Error(`readFile (Blob): Errore HTTP ${response.status}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer);
}

/** @param {string} path */
async function readDir(path)
{
	if (fs.existsSync(path))
		return (fs.readdirSync(path));
	let prefix = cleanPath(path);
	if (prefix && !prefix.endsWith("/"))
	{
		prefix += "/";
	}
	const { blobs } = await list({ prefix });
	const files = blobs
		.map((b) => b.pathname.replace(prefix, "").split("/")[0])
		.filter((name, index, self) => name && self.indexOf(name) === index);
	return files;
}

/** @param {string} path */
async function createFile(path)
{
	if (!env.VERCEL)
		return (fs.openSync(path, 'a+'));
	if (!(await existFile(path))) 
	{
		await writeFile(path, "");
	}
}

/** @param {string} path */
async function existFile(path)
{
	if (!env.VERCEL)
		return (fs.existsSync(path));
	const blobPath = cleanPath(path);
	const { blobs } = await list({ prefix: blobPath });
	return blobs.some((b) => b.pathname === blobPath);
}

/**
 * 
 *  @param {string} path 
 *  @param {*} data
*/
async function writeFile(path, data)
{
	if (!env.VERCEL)
	{
		if (!fs.existsSync(path))
			createFile(path);
		return (fs.writeFileSync(path, data));
	}
	const blobPath = cleanPath(path);
	return await put(blobPath, data, 
	{
		access: "public",
		addRandomSuffix: false,
	});
}

/** @param {string} path */
async function rmFile(path)
{
	if (fs.existsSync(path))
		return (fs.rmSync(path));
	
	const blobPath = cleanPath(path);
	const { blobs } = await list({ prefix: blobPath });
	const targetBlob = blobs.find((b) => b.pathname === blobPath);
	if (targetBlob) 
	{
		await del(targetBlob.url);
	}
}

/** 
 * @param {string} pathOld
 *  @param {string} pathNew 
 **/
async function copyFile(pathOld, pathNew)
{
	if (fs.existsSync(pathOld))
		return (fs.copyFileSync(pathOld, pathNew));
	
	const content = await readFile(pathOld);
	return await writeFile(pathNew, content);
}

/**
 * Clean the path for vercel
 * @param {string} path 
 */
function cleanPath(path)
{
	return (path.startsWith("./") ? path.slice(2) : path.replace(/^\/+/, ""));
}

export {readFile, readDir, createFile, existFile, writeFile, rmFile, copyFile};