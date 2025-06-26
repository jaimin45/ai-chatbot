import db from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master WHERE type='table';
    `
      )
      .all() as { name: string }[];

    const rowCount = db
      .prepare(`SELECT COUNT(*) as count FROM documents`)
      .get() as { count: number };

    return NextResponse.json({
      status: "success",
      tables: tables.map((t) => t.name),
      documentCount: rowCount.count,
    });
  } catch (err: any) {
    console.error("DB Debug Error:", err);
    return NextResponse.json(
      { status: "error", error: err.message },
      { status: 500 }
    );
  }
}
