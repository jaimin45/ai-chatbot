import fs from "fs";
import path from "path";
import { getEmbeddings } from "./embedding";
import { chunkText } from "./chunking";

export type DocumentChunk = {
  id: string;
  title: string;
  content: string;
  embedding: number[];
};

const documentChunks: DocumentChunk[] = [];

export function getDocumentChunks(): DocumentChunk[] {
  return documentChunks;
}

export async function addDocument(title: string, content: string) {
  const chunks = chunkText(content, 800); // Split big docs into small pieces (800 chars each)

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await getEmbeddings(chunks[i]);
    documentChunks.push({
      id: `${title}-${i}`,
      title,
      content: chunks[i],
      embedding,
    });
  }
}

export async function loadPreloadedDocs() {
  const dataDir = path.join(process.cwd(), "data");
  const files = fs.readdirSync(dataDir);

  for (const file of files) {
    const content = fs.readFileSync(path.join(dataDir, file), "utf8");
    await addDocument(file.replace(".txt", ""), content);
  }

  console.log(`✅ Loaded ${documentChunks.length} document chunks`);
}

// ✅ Load once on startup
await loadPreloadedDocs();
