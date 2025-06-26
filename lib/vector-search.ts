import db from "@/lib/db";
import { getEmbeddings, cosineSimilarity } from "@/lib/embedding";

export async function getTopKRelevantChunks(question: string, k: number) {
  const questionEmbedding = await getEmbeddings(question);

  const rows = db
    .prepare("SELECT id, title, content, embedding FROM documents")
    .all() as {
    id: number;
    title: string;
    content: string;
    embedding: string;
  }[];

  const scored = rows.map((row) => {
    const embedding = JSON.parse(row.embedding) as number[];
    const score = cosineSimilarity(questionEmbedding, embedding);
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      score,
    };
  });

  return scored
    .filter((doc) => doc.score >= 0.3) // Min threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
