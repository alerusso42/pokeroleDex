/** Every request, one client (keep alive off) */
interface Client {
	buff: string;
	type: number;
	//config: Map<string, any>;
	// history: string[];
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