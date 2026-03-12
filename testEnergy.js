require('dotenv').config();
const axios = require('axios');

const token = process.env.OURA_TOKEN;

if (!token || token === 'your_token_here') {
  console.error('Error: OURA_TOKEN is not set in .env');
  process.exit(1);
}

const today = new Date().toISOString().split('T')[0];
const params = { start_date: today, end_date: today };
const headers = { Authorization: `Bearer ${token}` };

const endpoints = [
  { name: 'Daily Readiness', url: 'https://api.ouraring.com/v2/usercollection/daily_readiness' },
  { name: 'Daily Activity',  url: 'https://api.ouraring.com/v2/usercollection/daily_activity' },
  { name: 'Daily Stress',    url: 'https://api.ouraring.com/v2/usercollection/daily_stress' },
];

(async () => {
  for (const ep of endpoints) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${ep.name} — ${today}`);
    console.log('='.repeat(60));
    try {
      const res = await axios.get(ep.url, { headers, params });
      console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error(`Error: ${err.response?.status} ${JSON.stringify(err.response?.data) || err.message}`);
    }
  }
})();
