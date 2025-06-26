import Database from "better-sqlite3";
import path from "path";

// Resolve absolute path for sqlite.db
const dbPath = path.resolve(process.cwd(), "sqlite.db");

// Initialize database
const db = new Database(dbPath);

// Always ensure the table exists (safe to run multiple times)
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding TEXT NOT NULL
  );
`);

console.log("✅ SQLite DB initialized. Table 'documents' ensured.");

export default db;
