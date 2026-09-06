import fs from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import "dotenv/config";

// Le due cartelle che vuoi inviare al cloud
const FOLDERS_TO_UPLOAD = ["../data/questData", "../data/questPictures"];

async function uploadDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Se è una sottocartella, entra ricorsivamente
      await uploadDirectory(fullPath);
    } else {
      // Pulisce il percorso per Vercel (es: data/questData/pokemon/pikachu.json)
      const fileContent = await fs.readFile(fullPath);
	  
	  const rawPath = fullPath.replace(/\\/g, "/"); // Normalizza i backslash su Windows
	  const blobPath = rawPath.replace(/^(\.\.\/|\.\/)+/, "").replace(/^\/+/, "");
	  
	console.log(`Caricamento ${blobPath}`);
	await put(blobPath, fileContent, {
	access: "private",
	addRandomSuffix: false,
	});
      console.log(`✔ Completato: ${blobPath}`);
    }
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ ERRORE: BLOB_READ_WRITE_TOKEN non trovato nel file .env!");
    process.exit(1);
  }

  for (const folder of FOLDERS_TO_UPLOAD) {
    console.log(`\n--- Inizio upload cartella: ${folder} ---`);
    await uploadDirectory(folder);
  }
  console.log("\n🎉 Seeding completato! Tutti i file sono su Vercel Blob.");
}

main().catch(console.error);