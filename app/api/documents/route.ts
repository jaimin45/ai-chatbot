import { NextResponse } from "next/server";
import db from "@/lib/db";

// ✅ GET: List all documents with total chunks per title
export async function GET() {
  try {
    const rows = db
      .prepare(
        `
      SELECT title, COUNT(*) as chunks
      FROM documents
      GROUP BY title
      ORDER BY title
    `
      )
      .all();

    return NextResponse.json({
      status: "success",
      documents: rows,
    });
  } catch (error: any) {
    console.error("Document list error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ DELETE: Delete all documents with a given title
export async function DELETE(req: Request) {
  try {
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required for deletion." },
        { status: 400 }
      );
    }

    const deleted = db
      .prepare(`DELETE FROM documents WHERE title = ?`)
      .run(title);

    return NextResponse.json({
      status: "success",
      deletedChunks: deleted.changes,
      message: `Deleted all chunks for '${title}'`,
    });
  } catch (error: any) {
    console.error("Document delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
