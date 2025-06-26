import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getEmbeddings } from "@/lib/embedding";
import { chunkText } from "@/lib/chunking";

export const runtime = "nodejs";

export async function GET() {
  const dataFolder = path.join(process.cwd(), "data");
  const files = fs.readdirSync(dataFolder).filter((f) => f.endsWith(".txt"));

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No .txt files found in /data folder." },
      { status: 400 }
    );
  }

  const insert = db.prepare(`
    INSERT INTO documents (title, chunk_index, content, embedding)
    VALUES (@title, @chunk_index, @content, @embedding)
  `);

  const insertMany = db.transaction((docs: any[]) => {
    for (const doc of docs) insert.run(doc);
  });

  let totalChunks = 0;

  for (const filename of files) {
    const filePath = path.join(dataFolder, filename);
    const text = fs.readFileSync(filePath, "utf-8");
    const chunks = chunkText(text);

    const docsToInsert = await Promise.all(
      chunks.map(async (chunk, index) => ({
        title: filename,
        chunk_index: index,
        content: chunk,
        embedding: JSON.stringify(await getEmbeddings(chunk)),
      }))
    );

    insertMany(docsToInsert);
    totalChunks += chunks.length;
    console.log(`✅ Imported '${filename}' with ${chunks.length} chunks.`);
  }

  return NextResponse.json({ message: "Import completed", files, totalChunks });
}
