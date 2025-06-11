const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'signs.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/signs', (req, res) => {
  const data = loadData();
  data.sort((a, b) => b.votes - a.votes);
  res.json(data);
});

app.post('/signs', (req, res) => {
  let { text } = req.body;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'text required' });
  }
  text = text.trim().toUpperCase().slice(0, 8);
  const data = loadData();
  const id = Date.now().toString();
  data.push({ id, text, votes: 0 });
  saveData(data);
  res.json({ id });
});

app.post('/signs/:id/vote', (req, res) => {
  const id = req.params.id;
  const data = loadData();
  const sign = data.find(s => s.id === id);
  if (!sign) return res.status(404).json({ error: 'not found' });
  sign.votes += 1;
  saveData(data);
  res.json({ votes: sign.votes });
});

app.get('/signs/random', (req, res) => {
  const data = loadData();
  if (data.length === 0) return res.status(404).json({ error: 'no signs' });
  const sign = data[Math.floor(Math.random() * data.length)];
  res.json(sign);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
