require('dotenv').config();
const axios = require('axios');

const token = process.env.OURA_TOKEN;

if (!token || token === 'your_token_here') {
  console.error('Error: OURA_TOKEN is not set in .env');
  process.exit(1);
}

const today = new Date();
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(today.getDate() - 180);

const fmt = (date) => date.toISOString().split('T')[0];

axios
  .get('https://api.ouraring.com/v2/usercollection/daily_sleep', {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      start_date: fmt(ninetyDaysAgo),
      end_date: fmt(today),
    },
  })
  .then((res) => {
    console.log(JSON.stringify(res.data, null, 2));
  })
  .catch((err) => {
    console.error('Request failed:', err.response?.status, err.response?.data || err.message);
  });
