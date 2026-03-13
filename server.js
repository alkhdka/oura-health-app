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

const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

async function ouraGet(endpoint, params) {
  const response = await axios.get(
    `https://api.ouraring.com/v2/usercollection/${endpoint}`,
    { headers: { Authorization: `Bearer ${token}` }, params }
  );
  return response.data;
}

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

  if (url.pathname === '/dashboard.html') {
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

  const now = new Date();
  const todayStr = fmt(now);
  const yd = new Date(now); yd.setDate(now.getDate() - 1);
  const yesterdayStr = fmt(yd);
  const td30 = new Date(now); td30.setDate(now.getDate() - 30);
  const thirtyDaysAgo = fmt(td30);

  const apiRoutes = {
    '/api/readiness':         { endpoint: 'daily_readiness', start: todayStr,     end: todayStr },
    '/api/activity':          { endpoint: 'daily_activity',  start: todayStr,     end: todayStr },
    '/api/stress':            { endpoint: 'daily_stress',    start: todayStr,     end: todayStr },
    '/api/sleep/yesterday':   { endpoint: 'daily_sleep',     start: todayStr,     end: todayStr },
    '/api/sleep/30days':      { endpoint: 'daily_sleep',     start: thirtyDaysAgo, end: yesterdayStr },
    '/api/readiness/30days':  { endpoint: 'daily_readiness', start: thirtyDaysAgo, end: todayStr },
    '/api/sleep/history':     { endpoint: 'daily_sleep',     start: thirtyDaysAgo, end: yesterdayStr },
    '/api/readiness/history': { endpoint: 'daily_readiness', start: thirtyDaysAgo, end: todayStr },
  };

  if (apiRoutes[url.pathname]) {
    const { endpoint, start: s, end: e } = apiRoutes[url.pathname];
    try {
      const data = await ouraGet(endpoint, { start_date: s, end_date: e });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/' || url.pathname === '/today' || url.pathname === '/today.html') {
    const file = path.join(__dirname, 'today.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Could not read today.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (url.pathname === '/latency' || url.pathname === '/latency.html') {
    const file = path.join(__dirname, 'latency.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Could not read latency.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (url.pathname === '/api/readiness/history180') {
    const now2 = new Date();
    const start180 = new Date(now2); start180.setDate(now2.getDate() - 180);
    try {
      const data = await ouraGet('daily_readiness', { start_date: fmt(start180), end_date: fmt(now2) });
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (url.pathname === '/recovery' || url.pathname === '/recovery.html') {
    const file = path.join(__dirname, 'recovery.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Could not read recovery.html');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
    return;
  }

  if (url.pathname === '/readiness' || url.pathname === '/readiness.html') {
    const file = path.join(__dirname, 'readiness.html');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Could not read readiness.html');
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
