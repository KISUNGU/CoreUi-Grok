
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ strict: false }));
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url} - Body:`, req.body);
  next();
});

// Configuration pour les uploads de fichiers
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Connexion à la base de données
const db = new sqlite3.Database('./mails.db', (err) => {
  if (err) console.error('Erreur de connexion à la base :', err);
  else console.log('Connecté à la base SQLite');
});

// Création des tables (au démarrage)
db.serialize(() => {
  // Table users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user'
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table users :', err.message);
    } else {
      console.log('Table users créée ou déjà existante.');
      // Insérer un utilisateur admin par défaut si aucun utilisateur n'existe
      db.get('SELECT * FROM users WHERE username = ?', ['admin'], (err, user) => {
        if (err) {
          console.error('Erreur lors de la vérification de l’utilisateur admin :', err.message);
          return;
        }
        if (!user) {
          const plainPassword = 'password123'; // Mot de passe en texte brut (temporaire)
          db.run(
            'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
            ['admin', plainPassword, 'admin@example.com', 'admin'],
            (err) => {
              if (err) {
                console.error('Erreur lors de l’insertion de l’utilisateur admin :', err.message);
              } else {
                console.log('Utilisateur admin créé avec succès.');
              }
            }
          );
        } else {
          console.log('Utilisateur admin existe déjà.');
        }
      });
    }
  });

  // Table incoming_mails (avec file_path)
  db.run(`
    CREATE TABLE IF NOT EXISTS incoming_mails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      sender TEXT NOT NULL,
      status TEXT DEFAULT 'nouveau',
      archived BOOLEAN DEFAULT 0,
      type TEXT,
      priority TEXT,
      mail_date TEXT,
      arrival_date TEXT,
      entity TEXT,
      file_path TEXT,
      assigned_to INTEGER,
      archived_date TEXT,
      archived_reason TEXT,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Table outgoing_mails (avec file_path)
  db.run(`
    CREATE TABLE IF NOT EXISTS outgoing_mails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      recipient TEXT NOT NULL,
      status TEXT DEFAULT 'brouillon',
      archived BOOLEAN DEFAULT 0,
      type TEXT,
      priority TEXT,
      send_date TEXT,
      entity TEXT,
      file_path TEXT,
      created_by INTEGER,
      archived_date TEXT,
      archived_reason TEXT,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Table actions_log
  db.run(`
    CREATE TABLE IF NOT EXISTS actions_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mail_id INTEGER NOT NULL,
      mail_type TEXT NOT NULL,
      action TEXT NOT NULL,
      user_id INTEGER NOT NULL,
      action_date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Table contacts
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      entity TEXT
    )
  `);
});

// Routes d’authentification (sans bcrypt)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Les champs username et password sont obligatoires.' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé.' });

    // Comparaison en texte brut (temporaire)
    if (password !== user.password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    res.json({ id: user.id, username: user.username, role: user.role });
  });
});

app.post('/api/logout', (req, res) => {
  res.json({ message: 'Déconnexion réussie.' });
});

// Routes pour les utilisateurs (getters)
app.get('/api/users', (req, res) => {
  db.all('SELECT id, username, email, role FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT id, username, email, role FROM users WHERE id = ?', [id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    res.json(user);
  });
});

// Routes pour les courriers entrants
app.get('/api/mails/incoming', (req, res) => {
  db.all(
    'SELECT im.*, u.username as assigned_to_name FROM incoming_mails im LEFT JOIN users u ON im.assigned_to = u.id WHERE im.archived = 0',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/mails/incoming/archived', (req, res) => {
  const { subject, sender, status } = req.query;
  let query = 'SELECT im.*, u.username as assigned_to_name FROM incoming_mails im LEFT JOIN users u ON im.assigned_to = u.id WHERE im.archived = 1';
  const params = [];
  if (subject) {
    query += ' AND im.subject LIKE ?';
    params.push(`%${subject}%`);
  }
  if (sender) {
    query += ' AND im.sender LIKE ?';
    params.push(`%${sender}%`);
  }
  if (status) {
    query += ' AND im.status = ?';
    params.push(status);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/mails/incoming', upload.single('file'), (req, res) => {
  const { subject, sender, type, priority, mail_date, arrival_date, entity, assigned_to } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    'INSERT INTO incoming_mails (subject, sender, type, priority, mail_date, arrival_date, entity, file_path, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [subject, sender, type, priority, mail_date, arrival_date, entity, file_path, assigned_to || null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const mailId = this.lastID;
      db.run(
        'INSERT INTO actions_log (mail_id, mail_type, action, user_id) VALUES (?, ?, ?, ?)',
        [mailId, 'incoming', 'créé', 1],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: mailId, subject, sender, type, priority, mail_date, arrival_date, entity, file_path, assigned_to });
        }
      );
    }
  );
});

app.put('/api/mails/update/:id', (req, res) => {
  const { id } = req.params;
  const { status, archived, assigned_to, archived_reason } = req.body;
  const archived_date = archived ? new Date().toISOString() : null;
  db.run(
    'UPDATE incoming_mails SET status = ?, archived = ?, assigned_to = ?, archived_date = ?, archived_reason = ? WHERE id = ?',
    [status, archived, assigned_to || null, archived_date, archived_reason, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (archived) {
        db.run(
          'INSERT INTO actions_log (mail_id, mail_type, action, user_id) VALUES (?, ?, ?, ?)',
          [id, 'incoming', `archivé - ${archived_reason || 'sans raison'}`, 1]
        );
      }
      res.json({ id, status, archived, assigned_to, archived_date, archived_reason });
    }
  );
});

// Routes pour les courriers sortants
app.get('/api/mails/outgoing', (req, res) => {
  db.all(
    'SELECT om.*, u.username as created_by_name FROM outgoing_mails om LEFT JOIN users u ON om.created_by = u.id WHERE om.archived = 0',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/mails/outgoing/archived', (req, res) => {
  const { subject, recipient, status } = req.query;
  let query = 'SELECT om.*, u.username as created_by_name FROM outgoing_mails om LEFT JOIN users u ON om.created_by = u.id WHERE om.archived = 1';
  const params = [];
  if (subject) {
    query += ' AND om.subject LIKE ?';
    params.push(`%${subject}%`);
  }
  if (recipient) {
    query += ' AND om.recipient LIKE ?';
    params.push(`%${recipient}%`);
  }
  if (status) {
    query += ' AND om.status = ?';
    params.push(status);
  }
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/mails/outgoing', upload.single('file'), (req, res) => {
  const { subject, recipient, type, priority, send_date, entity } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;
  const created_by = 1; // Utilisateur par défaut (admin)
  db.run(
    'INSERT INTO outgoing_mails (subject, recipient, type, priority, send_date, entity, file_path, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [subject, recipient, type, priority, send_date, entity, file_path, created_by],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const mailId = this.lastID;
      db.run(
        'INSERT INTO actions_log (mail_id, mail_type, action, user_id) VALUES (?, ?, ?, ?)',
        [mailId, 'outgoing', 'créé', created_by],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ id: mailId, subject, recipient, type, priority, send_date, entity, file_path, created_by });
        }
      );
    }
  );
});

app.put('/api/mails/outgoing/update/:id', (req, res) => {
  const { id } = req.params;
  const { status, archived, archived_reason } = req.body;
  const archived_date = archived ? new Date().toISOString() : null;
  db.run(
    'UPDATE outgoing_mails SET status = ?, archived = ?, archived_date = ?, archived_reason = ? WHERE id = ?',
    [status, archived, archived_date, archived_reason, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (archived) {
        db.run(
          'INSERT INTO actions_log (mail_id, mail_type, action, user_id) VALUES (?, ?, ?, ?)',
          [id, 'outgoing', `archivé - ${archived_reason || 'sans raison'}`, 1]
        );
      }
      res.json({ id, status, archived, archived_date, archived_reason });
    }
  );
});

// Routes pour les actions (getters)
app.get('/api/actions', (req, res) => {
  db.all(
    'SELECT al.*, u.username as user_name FROM actions_log al LEFT JOIN users u ON al.user_id = u.id ORDER BY al.action_date DESC',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.get('/api/actions/:mail_id/:mail_type', (req, res) => {
  const { mail_id, mail_type } = req.params;
  db.all(
    'SELECT al.*, u.username as user_name FROM actions_log al LEFT JOIN users u ON al.user_id = u.id WHERE al.mail_id = ? AND al.mail_type = ? ORDER BY al.action_date DESC',
    [mail_id, mail_type],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Routes pour les contacts (getters et création)
app.get('/api/contacts', (req, res) => {
  db.all('SELECT * FROM contacts', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, contact) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!contact) return res.status(404).json({ error: 'Contact non trouvé.' });
    res.json(contact);
  });
});

app.post('/api/contacts', (req, res) => {
  const { name, email, entity } = req.body;
  db.run(
    'INSERT INTO contacts (name, email, entity) VALUES (?, ?, ?)',
    [name, email, entity],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, email, entity });
    }
  );
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});