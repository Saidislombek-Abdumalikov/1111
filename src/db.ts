import Database from 'better-sqlite3';

const db = new Database('ielts_tracker.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES groups(id)
  );

  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    attendance TEXT DEFAULT '', -- 'Keldi', 'Kelmadi'
    homework TEXT DEFAULT '',   -- 'Topshirdi', 'Topshirmadi'
    note TEXT DEFAULT '',
    FOREIGN KEY (student_id) REFERENCES students(id),
    UNIQUE(student_id, date)
  );
`);

// Seed data if empty
const groupCount = db.prepare('SELECT count(*) as count FROM groups').get() as { count: number };
if (groupCount.count === 0) {
  const insertGroup = db.prepare('INSERT INTO groups (name) VALUES (?)');
  const insertStudent = db.prepare('INSERT INTO students (name, group_id) VALUES (?, ?)');

  const groups = ['Group A (Morning)', 'Group B (Afternoon)', 'Group C (Evening)'];
  
  groups.forEach((groupName) => {
    const result = insertGroup.run(groupName);
    const groupId = result.lastInsertRowid;
    
    // Add 20 dummy students
    for (let i = 1; i <= 20; i++) {
      insertStudent.run(`Student ${i}`, groupId);
    }
  });
}

export default db;
