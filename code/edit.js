const lib = require("./utils/lib.js");

const questDataPath = "data/questData/";

/**
 * 
 * @param {lib.types.Server} server 
 * @param {lib.types.Client} client 
 * @param {Response} res 
 */
function edit(server, client, res)
{
	//client.dataName = client.dataName.replace("", "");
	client.dirName = client.dirName.replace("api", "");
	let exists = server.data[client.dirName].find(name => name == client.dataName);
	if (exists == null)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let filename = questDataPath + client.dirName + "/" + client.dataName + ".json";
	console.log(filename);
	if (lib.fs.existsSync(filename) == false)
	{
		res.status(404);
		res.end(getHtml("./html/error/404.html").serialize());
		return ;
	}
	let json = client.body;
	if (client.dirName == "trainer")
		handleNewPokemonGeneration(server, json);
	lib.fs.writeFileSync(filename, JSON.stringify(json, null, 2), 'utf-8');
	res.status(200);
	res.send(json);
}

//FIXME da riscrivere per bene

/**
 * Gestisce la creazione di nuovi Pokémon per un Trainer
 * @param {object} server - L'istanza del server
 * @param {object} json - Il JSON del Trainer che stiamo salvando
 */
function handleNewPokemonGeneration(server, json) {
    const templatePath = questDataPath + "template/pokemon.json";


    // 1. Cicliamo l'array Pokemon del Trainer alla ricerca di "NEW:Specie:Rank"
    json.Pokemon = json.Pokemon.map((entry) => {
        if (typeof entry === 'string' && entry.startsWith("NEW:")) {
            
            // 2. Estraiamo i dati dalla stringa (es: "NEW:Pikachu:Starter")
            const [, species, rank] = entry.split(":");

            // 3. Generiamo un ID univoco (timestamp + numero casuale per sicurezza)
            const newId = `${species}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

            try {
                // 4. Leggiamo il template
                const templateRaw = lib.fs.readFileSync(templatePath, 'utf-8');
                let newPokemon = JSON.parse(templateRaw);

                // 5. Personalizziamo il nuovo Pokémon
                newPokemon.Id = newId;
                newPokemon.Species = species;
                newPokemon.Trainer = json.Name; // Colleghiamo il nome dell'allenatore
                
                // Qui potresti aggiungere logica extra basata sul Rank (es. alzare le statistiche)
                // newPokemon.Rank = rank; 

                // 6. Salviamo il nuovo file JSON sul disco
                const savePath = questDataPath + "pokemon/" + newId + ".json";
                lib.fs.writeFileSync(savePath, JSON.stringify(newPokemon, null, 2), 'utf-8');
                // 7. Aggiorniamo la memoria del server (se il tuo engine lo richiede)
                if (server.data && server.data.pokemon) {
                    server.data.pokemon.push(newPokemon);
                }

                console.log(`[SERVER] Creato nuovo Pokémon: ${newId} per ${json.Name}`);

                // Ritorniamo l'ID reale che prenderà il posto della stringa "NEW:..."
                return newId;

            } catch (err) {
                console.error("[ERRORE] Creazione nuovo Pokémon fallita:", err);
                return null; // O gestisci l'errore come preferisci
            }
        }
        
        // Se non è un nuovo Pokémon, lasciamo l'ID così com'è
        return entry;
    }).filter(id => id !== null); // Rimuoviamo eventuali fallimenti
}

module.exports = {edit};