import { NextResponse } from "next/server";
import OpenAI from "openai";
import db from "@/lib/db";
import { getEmbeddings, cosineSimilarity } from "@/lib/embedding";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ Similarity threshold for considering a document relevant
const SIMILARITY_THRESHOLD = 0.5; // You can adjust this as needed (0.6 = recommended starting point)

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json(
        { error: "❌ No question provided." },
        { status: 400 }
      );
    }

    // ✅ Step 1: Get embedding for the user question
    const questionEmbedding = await getEmbeddings(question);

    // ✅ Step 2: Fetch all document chunks from DB
    const allChunks = db
      .prepare(
        `
      SELECT id, title, content, embedding
      FROM documents
    `
      )
      .all();

    // ✅ Step 3: Calculate cosine similarity for each chunk
    const scoredChunks = allChunks.map((chunk: any) => {
      const embedding = JSON.parse(chunk.embedding) as number[];
      const score = cosineSimilarity(questionEmbedding, embedding);
      return {
        id: chunk.id,
        title: chunk.title,
        content: chunk.content,
        score,
      };
    });

    // ✅ Step 4: Filter top relevant chunks above threshold
    const topChunks = scoredChunks
      .filter((c) => c.score >= SIMILARITY_THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // ✅ Step 5: If no relevant documents found → Stop and return friendly message
    if (topChunks.length === 0) {
      return NextResponse.json({
        message:
          "❌ No relevant information found in your uploaded documents for this question.",
        matchedDocuments: [],
      });
    }

    // ✅ Step 6: Build context for GPT
    const contextText = topChunks
      .map((c, idx) => `(${idx + 1}) ${c.content}`)
      .join("\n\n");

    const prompt = `
You are a helpful AI assistant. Only answer the following question based on the provided document context.

If the context does not contain relevant information, say: "❌ No relevant information found in your uploaded documents for this question."

---

Question:
${question}

---

Document Context:
${contextText}

---

Answer (Concise and cite document titles where possible):
`;

    // ✅ Step 7: Call OpenAI Chat API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Or gpt-3.5-turbo
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const answer = completion.choices[0].message.content || "";

    // ✅ Step 8: Return AI answer and top matching documents
    const matchedDocuments = topChunks.map((c) => ({
      title: c.title,
      snippet: c.content.slice(0, 150) + "...",
      score: c.score,
    }));

    return NextResponse.json({
      message: answer,
      matchedDocuments,
    });
  } catch (error: any) {
    console.error("Docs QA API error:", error);
    return NextResponse.json(
      { error: "❌ Internal Server Error. Please try again." },
      { status: 500 }
    );
  }
}
