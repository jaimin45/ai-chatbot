import { NextResponse } from "next/server";
import db from "@/lib/db";
import { chunkText } from "@/lib/chunking";
import { getEmbeddings } from "@/lib/embedding";

export async function POST(req: Request) {
  const formData = await req.formData();
  const files = formData.getAll("file") as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const insert = db.prepare(`
    INSERT INTO documents (title, chunk_index, content, embedding)
    VALUES (@title, @chunk_index, @content, @embedding)
  `);

  const insertMany = db.transaction((docs: any[]) => {
    for (const doc of docs) insert.run(doc);
  });

  let totalChunks = 0;

  try {
    for (const file of files) {
      if (!file.name.endsWith(".txt")) {
        console.log(`Skipping unsupported file: ${file.name}`);
        continue;
      }

      const buffer = await file.arrayBuffer();
      const text = new TextDecoder().decode(buffer);
      const chunks = chunkText(text);

      console.log(`✅ File: ${file.name}, Total chunks: ${chunks.length}`);

      const docsToInsert = await Promise.all(
        chunks.map(async (chunk, index) => ({
          title: file.name,
          chunk_index: index,
          content: chunk,
          embedding: JSON.stringify(await getEmbeddings(chunk)),
        }))
      );

      insertMany(docsToInsert);
      totalChunks += chunks.length;
    }

    return NextResponse.json({
      message: "TXT files uploaded and embedded successfully",
      totalFiles: files.length,
      totalChunks,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
