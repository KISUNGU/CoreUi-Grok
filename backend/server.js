const { queryMemoryStore, buildMemoryStore } = require('./ai/memory-vector-store');
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// const db = require('./database'); // 🔗 Connexion SQLite
require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const winston = require('winston');
const PDFParse = require('pdf-parse');

const app = express();
const port = 3000;

console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Loaded' : 'Not loaded');

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log' }),
  ],
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

// Configuration pour les fichiers joints
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez .doc, .docx ou .pdf.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite à 5 Mo
});

// Création des tables
db.serialize(() => {
  // Tables existantes

  //1. correspondances externes
  db.run(`
    CREATE TABLE IF NOT EXISTS correspondances_externes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL,
      destinataire TEXT NOT NULL,
      objet TEXT NOT NULL,
      date TEXT NOT NULL,
      piece_jointe TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Erreur lors de la création de la table correspondances_externes :', err.message);
    } else {
      console.log('Table correspondances_externes vérifiée/créée');
    }
  });

//2. courriers entrants
db.run(`
    CREATE TABLE IF NOT EXISTS incoming_mails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      sender TEXT NOT NULL,
      mail_date TEXT NOT NULL,
      arrival_date TEXT NOT NULL,
      ref_code TEXT,
      file_path TEXT,
      status TEXT,
      comment TEXT
    )
  `, (err) => {
    if (err) console.error('Erreur création table incoming_mails :', err.message);
    else console.log('Table incoming_mails créée ou existante.');
  });

//3. courriers sortants
db.run(`
  CREATE TABLE IF NOT EXISTS outgoing_mails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipient TEXT NOT NULL,
    cc TEXT,
    subject TEXT NOT NULL,
    content TEXT,
    mail_date TEXT,
    file_path TEXT,
    status TEXT DEFAULT 'Brouillon'
  )
`, (err) => {
  if (err) {
    console.error('Erreur lors de la création de la table outgoing_mails :', err.message);
  } else {
    console.log('Table outgoing_mails vérifiée/créée');
  }
});

//5. approvisionnements
  db.run(`
    CREATE TABLE IF NOT EXISTS approvisionnements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT
    )
  `, (err) => {
    if (err) console.error('Erreur création table approvisionnements :', err.message);
    else console.log('Table approvisionnements créée ou existante.');
  });

//6. achats
  db.run(`
    CREATE TABLE IF NOT EXISTS achats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      supplier TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT
    )
  `, (err) => {
    if (err) console.error('Erreur création table achats :', err.message);
    else console.log('Table achats créée ou existante.');
  });

//7. paiements
  db.run(`
    CREATE TABLE IF NOT EXISTS paiements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT
    )
  `, (err) => {
    if (err) console.error('Erreur création table paiements :', err.message);
    else console.log('Table paiements créée ou existante.');
  });

//8. stocks
  db.run(`
    CREATE TABLE IF NOT EXISTS stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      entry_date TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table stocks :', err.message);
    else console.log('Table stocks créée ou existante.');
  });

//9. reservations
  db.run(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table reservations :', err.message);
    else console.log('Table reservations créée ou existante.');
  });


//12. mobilisations
  db.run(`
    CREATE TABLE IF NOT EXISTS mobilisations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table mobilisations :', err.message);
    else console.log('Table mobilisations créée ou existante.');
  });

//12. archives
  db.run(`
    CREATE TABLE IF NOT EXISTS archives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      category TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table archives :', err.message);
    else console.log('Table archives créée ou existante.');
  });

//13. pv
  db.run(`
    CREATE TABLE IF NOT EXISTS pv (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table pv :', err.message);
    else console.log('Table pv créée ou existante.');
  });

//14. annuaire
  db.run(`
    CREATE TABLE IF NOT EXISTS directory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      position TEXT,
      organization TEXT,
      email TEXT,
      category TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table directory :', err.message);
    else console.log('Table directory créée ou existante.');
  });

//15. équipements
  db.run(`
    CREATE TABLE IF NOT EXISTS equipments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      acquisition_date TEXT NOT NULL
    )
  `, (err) => {
    if (err) console.error('Erreur création table equipments :', err.message);
    else console.log('Table equipments créée ou existante.');
  });

  //16. messages (pour IA et conversations)
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      user_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Erreur création table messages :', err.message);
    else console.log('Table messages créée ou existante.');
  });

  //17. fichiers uploadés
  db.run(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      extracted_text TEXT
    )
  `, (err) => {
    if (err) console.error('Erreur création table files :', err.message);
    else console.log('Table files créée ou existante.');
  });

  //18. correspondances internes
  db.run(`
      CREATE TABLE IF NOT EXISTS correspondances_internes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reference TEXT NOT NULL,
        destinataire TEXT NOT NULL,
        objet TEXT NOT NULL,
        date TEXT NOT NULL,
        fonction TEXT,
        type_document TEXT NOT NULL,
        piece_jointe TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Erreur lors de la création de la table correspondances_internes :', err.message);
      } else {
        console.log('Table correspondances_internes vérifiée/créée');
      }
    });
});

// Fonction pour extraire le texte d'un PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdf = await PDFParse(dataBuffer);
    return pdf.text.trim();
  } catch (error) {
    logger.error('Erreur extraction texte PDF', { filePath, error: error.message });
    return '';
  }
}

// Fonction pour extraire le texte de tous les PDF dans Uploads
async function getAllPDFContent() {
  try {
    const files = await fs.readdir(path.join(__dirname, 'Uploads'));
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');
    let combinedText = '';

    for (const file of pdfFiles) {
      const filePath = path.join(__dirname, 'Uploads', file);
      const text = await extractTextFromPDF(filePath);
      if (text) {
        combinedText += `\n--- Contenu de ${file} ---\n${text}\n`;
      }
    }

    return combinedText;
  } catch (error) {
    logger.error('Erreur lecture dossier Uploads', { error: error.message });
    return '';
  }
}

// Middleware pour enregistrer l'historique
const logHistory = (entityType, entityId, action, details) => {
  const timestamp = new Date().toISOString();
  db.run(
    `INSERT INTO history (entityType, entityId, action, details, timestamp) VALUES (?, ?, ?, ?, ?)`,
    [entityType, entityId, action, details, timestamp],
    (err) => {
      if (err) console.error('Erreur lors de l\'enregistrement dans l\'historique :', err);
    }
  );
};


// Routes API
app.get('/', (req, res) => {
  res.send('Bienvenue dans le backend des courriers !');
});

// Récupérer les courriers entrants
app.get('/api/mails/incoming', (req, res) => {
  db.all('SELECT * FROM incoming_mails', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des courriers entrants :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});


// Récupérer les approvisionnements
app.get('/api/approvisionnements', (req, res) => {
  db.all('SELECT * FROM approvisionnements', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des approvisionnements :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les achats
app.get('/api/stocks', (req, res) => {
  db.all('SELECT * FROM stocks', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des stocks :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les archives par catégorie
app.get('/api/archives/:category', (req, res) => {
  const { category } = req.params;
  db.all('SELECT * FROM archives WHERE category = ?', [category], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des documents :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les PV par catégorie
app.get('/api/pv/:category', (req, res) => {
  const { category } = req.params;
  db.all('SELECT * FROM pv WHERE category = ?', [category], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des documents :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les entrées de l'annuaire
app.get('/api/directory', (req, res) => {
  db.all('SELECT * FROM directory', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des entrées :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les équipements
app.get('/api/equipments', (req, res) => {
  db.all('SELECT * FROM equipments', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des équipements :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les mobilisations
app.get('/api/achats', (req, res) => {
  db.all('SELECT * FROM achats', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des achats :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les paiements
app.get('/api/paiements', (req, res) => {
  db.all('SELECT * FROM paiements', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des paiements :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer les réservations
app.get('/api/reservations', (req, res) => {
  db.all('SELECT * FROM reservations', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des réservations :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer la liste des fichiers uploadés
app.get('/api/files', (req, res) => {
  db.all('SELECT filename FROM files', [], (err, rows) => {
    if (err) {
      logger.error('Erreur lors de la récupération des fichiers', { error: err.message });
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    const files = rows.map((row) => row.filename);
    res.json({ files });
  });
});

// Récupérer tous les courriers sortants
// Endpoint pour récupérer tous les courriers sortants
app.get('/api/mails/outgoing', (req, res) => {
  console.log('Requête reçue pour GET /api/mails/outgoing');
  db.all('SELECT * FROM outgoing_mails', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des courriers :', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Courriers sortants récupérés :', rows);
    res.json(rows);
  });
});

// Récupérer les messages d'une session
app.get('/api/messages/:session_id', (req, res) => {
  db.all(
    `SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC`,
    [req.params.session_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ messages: rows });
    }
  );
});

// Récupérer les conversations (sessions) d'un utilisateur
app.get('/api/conversations/:user_id', (req, res) => {
  db.all(
    `SELECT DISTINCT session_id, MAX(timestamp) as last FROM messages WHERE user_id = ? GROUP BY session_id ORDER BY last DESC`,
    [req.params.user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ sessions: rows });
    }
  );
});

// Endpoint GET pour récupérer toutes les correspondances externes
app.get('/api/correspondances-externes', (req, res) => {
  console.log('Requête reçue pour GET /api/correspondances-externes');
  db.all('SELECT * FROM correspondances_externes', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des correspondances :', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Correspondances récupérées :', rows);
    res.json(rows);
  });
});

// Endpoints pour correspondances_internes
app.get('/api/correspondances-internes', (req, res) => {
  db.all('SELECT * FROM correspondances_internes', [], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des correspondances internes :', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint pour mettre à jour un courrier sortant (validation)
app.put('/api/mails/outgoing/:id', (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  console.log(`Mise à jour du courrier ID ${id} avec statut : ${status}`);
  if (!status) {
    return res.status(400).json({ error: 'Le statut est requis' });
  }

  db.run(
    `UPDATE outgoing_mails SET status = ? WHERE id = ?`,
    [status, id],
    function (err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du courrier :', err.message);
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Courrier non trouvé' });
      }
      console.log(`Courrier ID ${id} mis à jour avec succès`);
      res.json({ message: 'Courrier mis à jour avec succès' });
    }
  );
});

// Ajouter un nouveau courrier entrant
app.post('/api/approvisionnements', (req, res) => {
  const { date, amount, description } = req.body;
  db.run(
    `INSERT INTO approvisionnements (date, amount, description) VALUES (?, ?, ?)`,
    [date, amount, description],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un approvisionnement :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouvel achat
app.post('/api/achats', (req, res) => {
  const { date, supplier, amount, description } = req.body;
  db.run(
    `INSERT INTO achats (date, supplier, amount, description) VALUES (?, ?, ?, ?)`,
    [date, supplier, amount, description],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un achat :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter une nouvelle mobilisation
app.post('/api/mobilisations', (req, res) => {
  const { source, amount, date } = req.body;
  db.run(
    `INSERT INTO mobilisations (source, amount, date) VALUES (?, ?, ?)`,
    [source, amount, date],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'une mobilisation :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouveau stock
app.post('/api/stocks', (req, res) => {
  const { name, category, quantity, entry_date } = req.body;
  db.run(
    `INSERT INTO stocks (name, category, quantity, entry_date) VALUES (?, ?, ?, ?)`,
    [name, category, quantity, entry_date],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un stock :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouveau courrier sortant
app.post('/api/mails/outgoing', upload.single('file'), (req, res) => {
  const { recipient, subject, content, mail_date } = req.body;
  const file_path = req.file ? `/Uploads/${req.file.filename}` : null;

  if (!recipient || !subject) {
    return res.status(400).json({ error: 'Destinataire et objet sont requis' });
  }

  db.run(
    `INSERT INTO outgoing_mails (recipient, subject, content, mail_date, file_path, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [recipient, subject, content || null, mail_date || new Date().toISOString().split('T')[0], file_path, 'Brouillon'],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'enregistrement du courrier :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouveau paiement
app.post('/api/paiements', (req, res) => {
  const { date, amount, description } = req.body;
  db.run(
    `INSERT INTO paiements (date, amount, description) VALUES (?, ?, ?)`,
    [date, amount, description],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un paiement :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter une nouvelle archive
app.post('/api/archives', (req, res) => {
  const { reference, type, date, description, file_path, category } = req.body;
  db.run(
    `INSERT INTO archives (reference, type, date, description, file_path, category) VALUES (?, ?, ?, ?, ?, ?)`,
    [reference, type, date, description, file_path, category],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un document :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouveau PV
app.post('/api/pv', (req, res) => {
  const { title, category } = req.body;
  db.run(
    `INSERT INTO pv (title, category) VALUES (?, ?)`,
    [title, category],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un document :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouveau courrier entrant
app.post('/api/mails/incoming', upload.single('file'), (req, res) => {
  const { subject, sender, mail_date, arrival_date, ref_code } = req.body;
  const file_path = req.file ? `/uploads/${req.file.filename}` : null;

  if (!subject || !sender || !mail_date || !arrival_date) {
    return res.status(400).json({ error: 'Les champs subject, sender, mail_date et arrival_date sont requis.' });
  }

  console.log('Données reçues :', { subject, sender, mail_date, arrival_date, ref_code, file_path });

  db.run(
    `INSERT INTO incoming_mails (subject, sender, mail_date, arrival_date, ref_code, file_path)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [subject, sender, mail_date, arrival_date, ref_code, file_path],
    function (err) {
      if (err) {
        console.error('Erreur SQLite :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter une nouvelle entrée dans l'annuaire
app.post('/api/directory', (req, res) => {
  const { name, position, organization, email, category } = req.body;
  db.run(
    `INSERT INTO directory (name, position, organization, email, category) VALUES (?, ?, ?, ?, ?)`,
    [name, position, organization, email, category],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout de l\'entrée :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter un nouvel équipement
app.post('/api/equipments', (req, res) => {
  const { name, type, status, acquisition_date } = req.body;
  db.run(
    `INSERT INTO equipments (name, type, status, acquisition_date) VALUES (?, ?, ?, ?)`,
    [name, type, status, acquisition_date],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'un équipement :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Ajouter une nouvelle réservation
app.post('/api/reservations', (req, res) => {
  const { name, destination, date, type } = req.body;
  db.run(
    `INSERT INTO reservations (name, destination, date, type) VALUES (?, ?, ?, ?)`,
    [name, destination, date, type],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout d\'une réservation :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Endpoint pour les requêtes AI simples
app.post('/api/ai-query', async (req, res) => {
  const { query } = req.body;
  if (typeof query !== 'string' || query.length > 1000) {
    return res.status(400).json({ error: 'Query invalide ou trop long.' });
  }

  if (!query) {
    return res.status(400).json({ error: 'Le champ query est requis.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI manquante.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: query }],
      max_tokens: 1000,
    });

    res.json({ result: completion.choices[0].message.content });
  } catch (error) {
    logger.error(`Erreur IA: ${error.message}`, { stack: error.stack });
    res.status(500).json({ error: `Erreur lors de la requête IA: ${error.message}` });
  }
});

// Endpoint pour les requêtes AI avec contexte vectoriel et PDF
app.post('/api/ask-openai', async (req, res) => {
  const { question, user_id } = req.body;

  if (!question || question.trim() === '' || typeof question !== 'string' || question.length > 1000) {
    return res.status(400).json({ error: 'Question invalide ou trop longue.' });
  }

  try {
    // Obtenir le contexte du magasin vectoriel
    const vectorContext = await queryMemoryStore(question);

    // Obtenir le contenu des PDF
    const pdfContent = await getAllPDFContent();

    const prompt = `
      Tu es un assistant IA qui aide à gérer les courriers internes, contrats, et documents de l’organisation.
      Contexte du magasin vectoriel :
      ${vectorContext || 'Aucun contexte vectoriel disponible.'}
      
      Contenu des documents PDF uploadés :
      ${pdfContent || 'Aucun document PDF disponible.'}
      
      Question de l'utilisateur : ${question.trim()}
      
      Réponds précisément en te basant sur le contexte et les documents fournis si pertinent, sinon utilise tes connaissances générales.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Tu es un assistant IA précis et professionnel.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = completion.choices[0].message.content.trim();

    // Sauvegarder dans messages
    db.run(
      `INSERT INTO messages (session_id, user_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [Date.now().toString(), user_id || null, 'user', question.trim(), new Date().toISOString()],
      (err) => {
        if (err) logger.error('Erreur sauvegarde question', { error: err.message });
      }
    );
    db.run(
      `INSERT INTO messages (session_id, user_id, role, content, timestamp) VALUES (?, ?, ?, ?, ?)`,
      [Date.now().toString(), user_id || null, 'assistant', result, new Date().toISOString()],
      (err) => {
        if (err) logger.error('Erreur sauvegarde réponse', { error: err.message });
      }
    );

    res.json({ result });
  } catch (error) {
    logger.error('Erreur lors de la requête IA', { error: error.message, stack: error.stack });
    res.status(500).json({ error: `Erreur lors de la requête IA: ${error.message}` });
  }
});

// Endpoint pour téléverser un PDF
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu.' });
  }

  const filePath = path.join(__dirname, 'Uploads', req.file.filename);
  const extractedText = await extractTextFromPDF(filePath);

  try {
    db.run(
      `INSERT INTO files (filename, path, upload_date, extracted_text) VALUES (?, ?, ?, ?)`,
      [req.file.originalname, `/Uploads/${req.file.filename}`, new Date().toISOString(), extractedText],
      function (err) {
        if (err) {
          logger.error('Erreur lors de l\'enregistrement du fichier', { error: err.message });
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: `Fichier ${req.file.originalname} téléversé avec succès.` });
      }
    );
  } catch (error) {
    logger.error('Erreur lors de l\'upload', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Endpoint pour réindexer les fichiers PDF et reconstruire le magasin vectoriel
app.post('/api/reindex', async (req, res) => {
  try {
    const files = await fs.readdir(path.join(__dirname, 'Uploads'));
    const pdfFiles = files.filter(file => path.extname(file).toLowerCase() === '.pdf');

    for (const file of pdfFiles) {
      const filePath = path.join(__dirname, 'Uploads', file);
      const extractedText = await extractTextFromPDF(filePath);
      db.run(
        `UPDATE files SET extracted_text = ? WHERE path = ?`,
        [extractedText, `/Uploads/${file}`],
        (err) => {
          if (err) {
            logger.error('Erreur mise à jour texte extrait', { file, error: err.message });
          }
        }
      );
    }

    // Relancer l'indexation du magasin vectoriel
    await buildMemoryStore();

    logger.info('Réindexation déclenchée.');
    res.json({ message: 'Réindexation effectuée.' });
  } catch (error) {
    logger.error('Erreur réindexation', { error: error.message });
    res.status(500).json({ error: 'Erreur lors de la réindexation' });
  }
});

// Endpoint pour ajouter un message à une session
app.post('/api/messages', (req, res) => {
  const { session_id, user_id, role, content } = req.body;
  db.run(
    `INSERT INTO messages (session_id, user_id, role, content) VALUES (?, ?, ?, ?)`,
    [session_id, user_id, role, content],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Endpoint POST pour créer une nouvelle correspondance externe
app.post('/api/correspondances-externes', upload.single('pieceJointe'), (req, res) => {
  const { reference, destinataire, objet, date } = req.body;
  const piece_jointe = req.file ? `/Uploads/${req.file.filename}` : null;

  console.log('Création d’une correspondance externe :', { reference, destinataire, objet, date, piece_jointe });

  if (!reference || !destinataire || !objet || !date) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  db.run(
    `INSERT INTO correspondances_externes (reference, destinataire, objet, date, piece_jointe) VALUES (?, ?, ?, ?, ?)`,
    [reference, destinataire, objet, date, piece_jointe],
    function (err) {
      if (err) {
        console.error('Erreur lors de l’enregistrement de la correspondance :', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Correspondance créée avec ID : ${this.lastID}`);
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Dans server.js, ajoutez cet endpoint après les autres
app.post('/api/correspondances-externes/bulk', (req, res) => {
  const correspondances = req.body; // Tableau d'objets [{ reference, destinataire, objet, date }]

  console.log('Importation de correspondances en masse :', correspondances);

  if (!Array.isArray(correspondances) || correspondances.length === 0) {
    return res.status(400).json({ error: 'Un tableau de correspondances est requis' });
  }

  const stmt = db.prepare(`
    INSERT INTO correspondances_externes (reference, destinataire, objet, date, piece_jointe)
    VALUES (?, ?, ?, ?, ?)
  `);

  db.serialize(() => {
    correspondances.forEach((corresp) => {
      if (!corresp.reference || !corresp.destinataire || !corresp.objet || !corresp.date) {
        console.warn('Correspondance incomplète ignorée :', corresp);
        return;
      }
      stmt.run(
        [corresp.reference, corresp.destinataire, corresp.objet, corresp.date, null],
        (err) => {
          if (err) {
            console.error('Erreur lors de l’insertion d’une correspondance :', err.message);
          }
        }
      );
    });
    stmt.finalize();
  });

  console.log('Correspondances importées avec succès');
  res.status(201).json({ message: 'Correspondances importées avec succès' });
});

// Endpoint POST pour créer une nouvelle correspondance interne
app.post('/api/correspondances-internes', upload.single('pieceJointe'), (req, res) => {
  const { reference, destinataire, objet, date, fonction, type_document } = req.body;
  const pieceJointe = req.file ? `/uploads/${req.file.filename}` : null;

  if (!reference || !destinataire || !objet || !date || !type_document) {
    return res.status(400).json({ error: 'Les champs référence, destinataire, objet, date et type de document sont requis' });
  }

  console.log('Création d’une correspondance interne :', { reference, destinataire, objet, date, fonction, type_document, pieceJointe });

  const stmt = db.prepare(`
    INSERT INTO correspondances_internes (reference, destinataire, objet, date, fonction, type_document, piece_jointe)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([reference, destinataire, objet, date, fonction || null, type_document, pieceJointe], function(err) {
    if (err) {
      console.error('Erreur lors de l’insertion de la correspondance interne :', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      console.log(`Correspondance interne insérée avec l’ID : ${this.lastID}`);
      res.status(201).json({ message: 'Correspondance interne créée avec succès', id: this.lastID });
    }
  });
  stmt.finalize();
});

// Mettre à jour un courrier entrant (statut, commentaire)
app.put('/api/mails/incoming/:id', (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  db.run(
    `UPDATE incoming_mails SET status = ?, comment = ? WHERE id = ?`,
    [status, comment, id],
    function (err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du courrier :', err.message);
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: 'Courrier mis à jour avec succès' });
    }
  );
});

// Archiver un courrier entrant
app.put('/api/mails/incoming/:id/archive', (req, res) => {
  const { id } = req.params;

  console.log(`Tentative d'archivage pour l'ID : ${id}`);
  db.run(
    `UPDATE incoming_mails SET status = 'Archivé' WHERE id = ?`,
    [id],
    function (err) {
      if (err) {
        console.error('Erreur SQL :', err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log(`Courrier avec l'ID ${id} archivé avec succès.`);
      res.status(200).json({ message: 'Courrier archivé avec succès' });
    }
  );
});

// Supprimer une archive, un PV, une entrée d'annuaire, un contrat, un courrier entrant, un stock, un équipement, une réservation, un appel d'offres, un achat ou un rapport
app.delete('/api/archives/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM archives WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression du document :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Document supprimé avec succès' });
  });
});

// Supprimer un PV
app.delete('/api/pv/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM pv WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression du document :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Document supprimé avec succès' });
  });
});

// Supprimer une entrée d'annuaire
app.delete('/api/directory/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM directory WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'entrée :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Entrée supprimée avec succès' });
  });
});

// Supprimer un courrier entrant
app.delete('/api/mails/incoming/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM incoming_mails WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression du courrier :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Courrier supprimé avec succès' });
  });
});

// Supprimer un stock, un équipement, une réservation, un appel d'offres ou un achat
app.delete('/api/stocks/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM stocks WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression d\'un stock :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Stock supprimé avec succès' });
  });
});

// Supprimer un équipement
app.delete('/api/equipments/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM equipments WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'équipement :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Équipement supprimé avec succès' });
  });
});

// Supprimer une réservation
app.delete('/api/reservations/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM reservations WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de la réservation :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Réservation supprimée avec succès' });
  });
});

// Supprimer un achat
app.delete('/api/achats/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM achats WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'achat :', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Achat supprimé avec succès' });
  });
});

// Endpoint DELETE pour supprimer une correspondance externe
app.delete('/api/correspondances-externes/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Suppression de la correspondance ID : ${id}`);

  db.run(`DELETE FROM correspondances_externes WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de la correspondance :', err.message);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Correspondance non trouvée' });
    }
    console.log(`Correspondance ID ${id} supprimée avec succès`);
    res.json({ message: 'Correspondance supprimée avec succès' });
  });
});

// Endpoint DELETE pour supprimer une correspondance interne
app.delete('/api/correspondances-internes/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT piece_jointe FROM correspondances_internes WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération de la correspondance interne :', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Correspondance interne non trouvée' });
    }
    const stmt = db.prepare('DELETE FROM correspondances_internes WHERE id = ?');
    stmt.run([id], function(err) {
      if (err) {
        console.error('Erreur lors de la suppression de la correspondance interne :', err.message);
        res.status(500).json({ error: 'Erreur serveur' });
      } else {
        if (row.piece_jointe) {
          const filePath = path.join(__dirname, row.piece_jointe);
          fs.unlink(filePath, (err) => {
            if (err) console.warn('Erreur lors de la suppression du fichier :', err.message);
          });
        }
        console.log(`Correspondance interne ID ${id} supprimée`);
        res.status(200).json({ message: 'Correspondance interne supprimée avec succès' });
      }
    });
    stmt.finalize();
  });
});


// Routes pour Planifications
app.get('/api/planifications', (req, res) => {
  db.all('SELECT * FROM planifications', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/planifications', upload.single('pieceJointe'), (req, res) => {
  const { reference, description, budget, dateDebut, dateFin, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    `INSERT INTO planifications (reference, description, budget, dateDebut, dateFin, statut, piece_jointe) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [reference, description, budget, dateDebut, dateFin, statut, piece_jointe],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('planification', this.lastID, 'CREATE', `Planification ${reference} créée`);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/api/planifications/bulk', (req, res) => {
  const planifications = req.body;
  let inserted = 0;
  const stmt = db.prepare(
    `INSERT INTO planifications (reference, description, budget, dateDebut, dateFin, statut) VALUES (?, ?, ?, ?, ?, ?)`
  );
  planifications.forEach((p) => {
    stmt.run(
      [p.reference, p.description, p.budget, p.dateDebut, p.dateFin, p.statut],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('planification', this.lastID, 'CREATE', `Planification ${p.reference} importée`);
        inserted++;
        if (inserted === planifications.length) {
          stmt.finalize();
          res.status(201).json({ message: `${inserted} planifications importées` });
        }
      }
    );
  });
});

app.put('/api/planifications/:id', upload.single('pieceJointe'), (req, res) => {
  const { id } = req.params;
  const { reference, description, budget, dateDebut, dateFin, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : req.body.piece_jointe;
  db.run(
    `UPDATE planifications SET reference = ?, description = ?, budget = ?, dateDebut = ?, dateFin = ?, statut = ?, piece_jointe = ? WHERE id = ?`,
    [reference, description, budget, dateDebut, dateFin, statut, piece_jointe, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Planification non trouvée' });
      logAction('planification', id, 'UPDATE', `Planification ${reference} modifiée`);
      res.json({ message: 'Planification mise à jour' });
    }
  );
});

app.delete('/api/planifications/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT reference FROM planifications WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Planification non trouvée' });
    db.run('DELETE FROM planifications WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('planification', id, 'DELETE', `Planification ${row.reference} supprimée`);
      res.json({ message: 'Planification supprimée' });
    });
  });
});

// Routes pour Appels d'Offres
app.get('/api/appels', (req, res) => {
  db.all('SELECT * FROM appels', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/appels', upload.single('pieceJointe'), (req, res) => {
  const { reference, description, budget, datePublication, dateCloture, statut, etape } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    `INSERT INTO appels (reference, description, budget, datePublication, dateCloture, statut, etape, piece_jointe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [reference, description, budget, datePublication, dateCloture, statut, etape, piece_jointe],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('appel', this.lastID, 'CREATE', `Appel d'offre ${reference} créé`);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/api/appels/bulk', (req, res) => {
  const appels = req.body;
  let inserted = 0;
  const stmt = db.prepare(
    `INSERT INTO appels (reference, description, budget, datePublication, dateCloture, statut, etape) VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  appels.forEach((a) => {
    stmt.run(
      [a.reference, a.description, a.budget, a.datePublication, a.dateCloture, a.statut, a.etape],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('appel', this.lastID, 'CREATE', `Appel d'offre ${a.reference} importé`);
        inserted++;
        if (inserted === appels.length) {
          stmt.finalize();
          res.status(201).json({ message: `${inserted} appels importés` });
        }
      }
    );
  });
});

app.put('/api/appels/:id', upload.single('pieceJointe'), (req, res) => {
  const { id } = req.params;
  const { reference, description, budget, datePublication, dateCloture, statut, etape } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : req.body.piece_jointe;
  db.run(
    `UPDATE appels SET reference = ?, description = ?, budget = ?, datePublication = ?, dateCloture = ?, statut = ?, etape = ?, piece_jointe = ? WHERE id = ?`,
    [reference, description, budget, datePublication, dateCloture, statut, etape, piece_jointe, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Appel non trouvé' });
      logAction('appel', id, 'UPDATE', `Appel d'offre ${reference} modifié`);
      res.json({ message: 'Appel mis à jour' });
    }
  );
});

app.delete('/api/appels/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT reference FROM appels WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Appel non trouvé' });
    db.run('DELETE FROM appels WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('appel', id, 'DELETE', `Appel d'offre ${row.reference} supprimé`);
      res.json({ message: 'Appel supprimé' });
    });
  });
});

// Routes pour Contrats
app.get('/api/contrats', (req, res) => {
  db.all('SELECT * FROM contrats', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/contrats', upload.single('pieceJointe'), (req, res) => {
  const { reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    `INSERT INTO contrats (reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut, piece_jointe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut, piece_jointe],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('contrat', this.lastID, 'CREATE', `Contrat ${reference} créé`);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/api/contrats/bulk', (req, res) => {
  const contrats = req.body;
  let inserted = 0;
  const stmt = db.prepare(
    `INSERT INTO contrats (reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  contrats.forEach((c) => {
    stmt.run(
      [c.reference, c.appelId, c.appelReference, c.fournisseur, c.montant, c.dateSignature, c.dateFin, c.statut],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('contrat', this.lastID, 'CREATE', `Contrat ${c.reference} importé`);
        inserted++;
        if (inserted === contrats.length) {
          stmt.finalize();
          res.status(201).json({ message: `${inserted} contrats importés` });
        }
      }
    );
  });
});

app.put('/api/contrats/:id', upload.single('pieceJointe'), (req, res) => {
  const { id } = req.params;
  const { reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : req.body.piece_jointe;
  db.run(
    `UPDATE contrats SET reference = ?, appelId = ?, appelReference = ?, fournisseur = ?, montant = ?, dateSignature = ?, dateFin = ?, statut = ?, piece_jointe = ? WHERE id = ?`,
    [reference, appelId, appelReference, fournisseur, montant, dateSignature, dateFin, statut, piece_jointe, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Contrat non trouvé' });
      logAction('contrat', id, 'UPDATE', `Contrat ${reference} modifié`);
      res.json({ message: 'Contrat mis à jour' });
    }
  );
});

app.delete('/api/contrats/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT reference FROM contrats WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Contrat non trouvé' });
    db.run('DELETE FROM contrats WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('contrat', id, 'DELETE', `Contrat ${row.reference} supprimé`);
      res.json({ message: 'Contrat supprimé' });
    });
  });
});

// Routes pour Rapports d'Attribution
app.get('/api/rapports', (req, res) => {
  db.all('SELECT * FROM rapports', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/rapports', upload.single('pieceJointe'), (req, res) => {
  const { reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : null;
  db.run(
    `INSERT INTO rapports (reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut, piece_jointe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut, piece_jointe],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('rapport', this.lastID, 'CREATE', `Rapport ${reference} créé`);
      res.status(201).json({ id: this.lastID });
    }
  );
});

app.post('/api/rapports/bulk', (req, res) => {
  const rapports = req.body;
  let inserted = 0;
  const stmt = db.prepare(
    `INSERT INTO rapports (reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  rapports.forEach((r) => {
    stmt.run(
      [r.reference, r.appelId, r.appelReference, r.fournisseur, r.score, r.justification, r.dateAttribution, r.statut],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        logAction('rapport', this.lastID, 'CREATE', `Rapport ${r.reference} importé`);
        inserted++;
        if (inserted === rapports.length) {
          stmt.finalize();
          res.status(201).json({ message: `${inserted} rapports importés` });
        }
      }
    );
  });
});

app.put('/api/rapports/:id', upload.single('pieceJointe'), (req, res) => {
  const { id } = req.params;
  const { reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut } = req.body;
  const piece_jointe = req.file ? `/uploads/${req.file.filename}` : req.body.piece_jointe;
  db.run(
    `UPDATE rapports SET reference = ?, appelId = ?, appelReference = ?, fournisseur = ?, score = ?, justification = ?, dateAttribution = ?, statut = ?, piece_jointe = ? WHERE id = ?`,
    [reference, appelId, appelReference, fournisseur, score, justification, dateAttribution, statut, piece_jointe, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Rapport non trouvé' });
      logAction('rapport', id, 'UPDATE', `Rapport ${reference} modifié`);
      res.json({ message: 'Rapport mis à jour' });
    }
  );
});

app.delete('/api/rapports/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT reference FROM rapports WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Rapport non trouvé' });
    db.run('DELETE FROM rapports WHERE id = ?', [id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      logAction('rapport', id, 'DELETE', `Rapport ${row.reference} supprimé`);
      res.json({ message: 'Rapport supprimé' });
    });
  });
});

// Routes pour l'Historique
app.get('/api/history', (req, res) => {
  db.all('SELECT * FROM history ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Gestion de la fermeture propre de la base de données à l'arrêt du serveur
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Erreur lors de la fermeture de la base de données :', err.message);
    } else {
      console.log('Connexion à la base de données fermée.');
    }
    process.exit(0);
  });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err.stack);
  res.status(500).json({ error: 'Une erreur inattendue est survenue.' });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});