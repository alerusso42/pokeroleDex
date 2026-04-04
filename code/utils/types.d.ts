/** Every request, one client (keep alive off) */
interface Client 
{
	buff: string;
	dataName: string;
	dirName: string;
	dirIndex: number;
	doc: Document;
}

/**
 * @typedef {Object} Example
 * @property {Map<string, number>} statistiche - Una mappa che associa nomi a numeri
 * @property {string[]} messaggi - Un array di stringhe
 * @property {Client} sessione - Un riferimento all'interfaccia Client definita sopra
 */

// /** @type {Client} */
// /** @param {Client} data */
// 