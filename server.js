const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/api/donation-options', async (req, res) => {
  try {
    const [oneTime, recurring] = await Promise.all([
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/14'),
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/62')
    ]);

    console.log('Engangsbidrag:', oneTime.data);
    console.log('Fast bidrag:', recurring.data);

    res.json({
      engangsbidrag: oneTime.data?.variants || [],
      fastbidrag: recurring.data?.variants || []
    });
  } catch (error) {
    console.error('Error fetching donation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch donation options' });
  }
});

app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
