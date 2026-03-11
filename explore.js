require('dotenv').config();
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

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

axios
  .get('https://api.ouraring.com/v2/usercollection/daily_sleep', {
    headers: { Authorization: `Bearer ${token}` },
    params: { start_date: fmt(start), end_date: fmt(today) },
  })
  .then((res) => {
    const data = res.data.data;

    if (!data.length) {
      console.log('No sleep data found.');
      return;
    }

    // Average sleep score
    const avg = data.reduce((sum, d) => sum + d.score, 0) / data.length;
    console.log(`\nAverage sleep score: ${avg.toFixed(1)}`);

    // Best and worst 5 nights
    const sorted = [...data].sort((a, b) => b.score - a.score);
    console.log('\nBest 5 nights:');
    sorted.slice(0, 5).forEach((d) => console.log(`  ${d.day}  score: ${d.score}`));
    console.log('\nWorst 5 nights:');
    sorted.slice(-5).reverse().forEach((d) => console.log(`  ${d.day}  score: ${d.score}`));

    // Best day of week by average score
    const byDay = {};
    data.forEach((d) => {
      const dow = new Date(d.day).getUTCDay();
      if (!byDay[dow]) byDay[dow] = [];
      byDay[dow].push(d.score);
    });
    const dowAvgs = Object.entries(byDay).map(([dow, scores]) => ({
      day: DAYS[dow],
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
    }));
    dowAvgs.sort((a, b) => b.avg - a.avg);
    console.log('\nAverage score by day of week:');
    dowAvgs.forEach((d) => console.log(`  ${d.day.padEnd(10)} ${d.avg.toFixed(1)}`));
    console.log(`\nBest day to sleep: ${dowAvgs[0].day}`);

    // Lowest contributor on average
    const contributorKeys = Object.keys(data[0].contributors);
    const contributorAvgs = contributorKeys.map((key) => ({
      name: key,
      avg: data.reduce((sum, d) => sum + d.contributors[key], 0) / data.length,
    }));
    contributorAvgs.sort((a, b) => a.avg - b.avg);
    console.log('\nContributor averages (lowest to highest):');
    contributorAvgs.forEach((c) =>
      console.log(`  ${c.name.padEnd(20)} ${c.avg.toFixed(1)}`)
    );
    console.log(`\nConsistently lowest contributor: ${contributorAvgs[0].name} (avg: ${contributorAvgs[0].avg.toFixed(1)})`);
  })
  .catch((err) => {
    console.error('Request failed:', err.response?.status, err.response?.data || err.message);
  });
