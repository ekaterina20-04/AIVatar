import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      session_id UUID NOT NULL,
      role VARCHAR(16) NOT NULL CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS messages_session_created_idx
      ON messages (session_id, created_at, id);
  `);
}

export async function getHistory(sessionId) {
  const result = await pool.query(
    `SELECT id, role, content, created_at AS "createdAt"
     FROM messages
     WHERE session_id = $1
     ORDER BY created_at, id`,
    [sessionId],
  );
  return result.rows;
}

export async function saveMessage(sessionId, role, content) {
  const result = await pool.query(
    `INSERT INTO messages (session_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, role, content, created_at AS "createdAt"`,
    [sessionId, role, content],
  );
  return result.rows[0];
}

