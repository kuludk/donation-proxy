const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

function extractVariants(raw) {
  try {
    const wrapped = JSON.parse(raw.Content);
    const inner = wrapped.objects?.[0]?.content;
    return JSON.parse(inner);
  } catch (err) {
    console.error('Failed to parse Hostedshop JSON:', err.message);
    return [];
  }
}

app.get('/api/donation-options', async (req, res) => {
  try {
    const [oneTime, recurring] = await Promise.all([
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/14'),
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/62')
    ]);

    const engangsbidrag = extractVariants(oneTime.data);
    const fastbidrag = extractVariants(recurring.data);

    res.json({ engangsbidrag, fastbidrag });
  } catch (error) {
    console.error('Error fetching donation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch donation options' });
  }
});

app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
