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

    // One-time is already a clean array
    const engangsbidrag = oneTime.data.map(v => ({
      id: v.Id,
      title: v.Title
    }));

    // Recurring: split into frequency vs amount
    const fastbidrag = {
      frequency: recurring.data
        .filter(v => v.TypeId === 8)
        .map(v => ({ id: v.Id, title: v.Title })),
      amounts: recurring.data
        .filter(v => v.TypeId === 7)
        .map(v => ({ id: v.Id, title: v.Title }))
    };

    res.json({ engangsbidrag, fastbidrag });
  } catch (error) {
    console.error('Error fetching donation data:', error.message);
    res.status(500).json({ error: 'Failed to fetch donation options' });
  }
});

app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
