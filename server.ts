import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db';

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.get('/api/groups', (req, res) => {
  const groups = db.prepare('SELECT * FROM groups').all();
  res.json(groups);
});

app.get('/api/groups/:groupId/students', (req, res) => {
  const { groupId } = req.params;
  const students = db.prepare('SELECT * FROM students WHERE group_id = ?').all(groupId);
  res.json(students);
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.prepare('UPDATE students SET name = ? WHERE id = ?').run(name, id);
  res.json({ success: true });
});

app.get('/api/grid', (req, res) => {
  const { groupId, startDate, endDate } = req.query;
  if (!groupId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const students = db.prepare('SELECT * FROM students WHERE group_id = ?').all(groupId);
  
  const records = db.prepare(`
    SELECT * FROM records 
    WHERE student_id IN (SELECT id FROM students WHERE group_id = ?)
    AND date BETWEEN ? AND ?
  `).all(groupId, startDate, endDate);

  res.json({ students, records });
});

app.post('/api/records', (req, res) => {
  const { student_id, date, attendance, homework, note } = req.body;
  
  // Upsert record
  const existing = db.prepare('SELECT id FROM records WHERE student_id = ? AND date = ?').get(student_id, date) as { id: number } | undefined;

  if (existing) {
    db.prepare(`
      UPDATE records 
      SET attendance = COALESCE(?, attendance), 
          homework = COALESCE(?, homework), 
          note = COALESCE(?, note)
      WHERE id = ?
    `).run(attendance, homework, note, existing.id);
  } else {
    db.prepare(`
      INSERT INTO records (student_id, date, attendance, homework, note) 
      VALUES (?, ?, ?, ?, ?)
    `).run(student_id, date, attendance || '', homework || '', note || '');
  }
  
  res.json({ success: true });
});

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
