/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  const contents = fs.readFileSync(envPath, "utf8");
  contents.split(/\r?\n/).forEach((line) => {
    if (!line || line.trim().startsWith("#")) return;
    const [key, ...rest] = line.split("=");
    if (!key) return;
    const value = rest.join("=").trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^"(.*)"$/, "$1");
    }
  });
}

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, "..", "data", "tasks.db");
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL or POSTGRES_URL environment variable.");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL;
const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined
});

const db = new sqlite3.Database(SQLITE_PATH);

function runSqliteAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

async function ensureTable() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      task_id TEXT,
      name TEXT,
      description TEXT,
      category TEXT,
      priority TEXT,
      status TEXT,
      start_date TEXT,
      due_date TEXT,
      est_time TEXT,
      act_time TEXT,
      remarks TEXT
    )`
  );
}

async function migrate() {
  console.log(`Reading from SQLite: ${SQLITE_PATH}`);
  const rows = await runSqliteAll("SELECT * FROM tasks ORDER BY id ASC");
  console.log(`Found ${rows.length} rows.`);

  if (rows.length === 0) {
    console.log("Nothing to migrate.");
    return;
  }

  const columns = [
    "task_id",
    "name",
    "description",
    "category",
    "priority",
    "status",
    "start_date",
    "due_date",
    "est_time",
    "act_time",
    "remarks"
  ];

  const values = [];
  const chunks = [];

  rows.forEach((row, rowIndex) => {
    const base = rowIndex * columns.length;
    values.push(
      row.task_id || "",
      row.name || "",
      row.description || "",
      row.category || "",
      row.priority || "",
      row.status || "",
      row.start_date || "",
      row.due_date || "",
      row.est_time || "",
      row.act_time || "",
      row.remarks || ""
    );
    const placeholders = columns.map((_, colIndex) => `$${base + colIndex + 1}`);
    chunks.push(`(${placeholders.join(", ")})`);
  });

  await pool.query(
    `INSERT INTO tasks (${columns.join(", ")}) VALUES ${chunks.join(", ")}`,
    values
  );

  console.log("Migration complete.");
}

(async () => {
  try {
    await ensureTable();
    await migrate();
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    db.close();
    await pool.end();
  }
})();
