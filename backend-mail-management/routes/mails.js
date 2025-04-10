const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/incoming', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM mails WHERE type = 'entrant' AND archived = FALSE");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/outgoing', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM mails WHERE type = 'sortant' AND archived = FALSE");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/archived', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM mails WHERE archived = TRUE");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', async (req, res) => {
  const { type, subject, sender, recipient } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO mails (type, subject, sender, recipient) VALUES (?, ?, ?, ?)',
      [type, subject, sender, recipient]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/update/:id', async (req, res) => {
  const { status, archived } = req.body;
  try {
    await db.query('UPDATE mails SET status = ?, archived = ? WHERE id = ?', [status, archived, req.params.id]);
    if (status) {
      await db.query('INSERT INTO tracking (mail_id, status_update) VALUES (?, ?)', [req.params.id, status]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tracking/:mailId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tracking WHERE mail_id = ?', [req.params.mailId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;