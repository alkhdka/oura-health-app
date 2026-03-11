require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const token = process.env.OURA_TOKEN;

if (!token || token === 'your_token_here') {
  console.error('Error: OURA_TOKEN is not set in .env');
  process.exit(1);
}

const today = new Date();
const start = new Date();
start.setDate(today.getDate() - 180);
const fmt = (d) => d.toISOString().split('T')[0];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/sleep') {
    try {
      const response = await axios.get(
        'https://api.ouraring.com/v2/usercollection/daily_sleep',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { start_date: fmt(start), end_date: fmt(today) },
        }
      );
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(JSON.stringify(response.data));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/' || url.pathname === '/dashboard.html') {
    const file = path.join(__dirname, 'dashboard.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Could not read dashboard.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
  console.log('Sleep data: http://localhost:3000/api/sleep');
});
