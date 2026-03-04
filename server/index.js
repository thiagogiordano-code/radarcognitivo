const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── Init DB ────────────────────────────────────────────────────────────────
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS student_records (
      id          TEXT PRIMARY KEY,
      completed_at TIMESTAMPTZ NOT NULL,
      profile      JSONB NOT NULL
    );
    CREATE TABLE IF NOT EXISTS turma_configs (
      id         TEXT PRIMARY KEY,
      name       TEXT UNIQUE NOT NULL,
      course     TEXT,
      created_at TIMESTAMPTZ NOT NULL
    );
  `);
  console.log('DB initialized');
}

// ─── Student Records ─────────────────────────────────────────────────────────
app.get('/records', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, completed_at, profile FROM student_records ORDER BY completed_at DESC'
    );
    res.json(rows.map(r => ({ id: r.id, completedAt: r.completed_at, profile: r.profile })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

app.post('/records', async (req, res) => {
  const { id, completedAt, profile } = req.body;
  try {
    await pool.query(
      'INSERT INTO student_records (id, completed_at, profile) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
      [id, completedAt, JSON.stringify(profile)]
    );
    res.status(201).json({ id, completedAt, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar registro' });
  }
});

app.delete('/records', async (req, res) => {
  try {
    await pool.query('DELETE FROM student_records');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao limpar registros' });
  }
});

app.delete('/records/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM student_records WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

// ─── Turma Configs ───────────────────────────────────────────────────────────
app.get('/turmas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, course, created_at FROM turma_configs ORDER BY name'
    );
    res.json(rows.map(r => ({ id: r.id, name: r.name, course: r.course, createdAt: r.created_at })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

app.post('/turmas', async (req, res) => {
  const { id, name, course, createdAt } = req.body;
  try {
    await pool.query(
      'INSERT INTO turma_configs (id, name, course, created_at) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING',
      [id, name.trim(), course || null, createdAt]
    );
    res.status(201).json({ id, name, course, createdAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar turma' });
  }
});

app.delete('/turmas', async (req, res) => {
  try {
    await pool.query('DELETE FROM turma_configs');
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao limpar turmas' });
  }
});

app.delete('/turmas/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM turma_configs WHERE id = $1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`)))
  .catch(err => { console.error('Falha ao inicializar DB:', err); process.exit(1); });
