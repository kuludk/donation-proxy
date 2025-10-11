const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Temporary debug version: just log the raw Hostedshop response
app.get('/api/donation-options', async (req, res) => {
  try {
    const [oneTime, recurring] = await Promise.all([
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/14'),
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/62')
    ]);

    // 👇 These logs will show us the exact structure in Render’s logs
    console.log('One-time RAW:', oneTime.data);
    console.log('Recurring RAW:', recurring.data);

    // For now, just return the raw data so we can inspect it
    res.json({ oneTime: oneTime.data, recurring: recurring.data });
  } catch (error) {
    console.error('Error fetching donation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch donation options' });
  }
});

app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
