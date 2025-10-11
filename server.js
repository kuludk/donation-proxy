const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Donation options route ---
app.get('/api/donation-options', async (req, res) => {
  try {
    const [oneTime, recurring] = await Promise.all([
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/14'),
      axios.get('https://shop.givenpigeret.dk/json/productvariants/data/62')
    ]);

    const engangsbidrag = oneTime.data.map(v => ({
      id: v.Id,
      title: v.Title
    }));

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

// --- Add-to-cart route ---
app.post('/api/add-to-cart', async (req, res) => {
  const { productId, variantIds } = req.body;

  try {
    // Build GraphQL mutation with one addToCart per variant
    const mutations = variantIds.map(vid => `
      addToCart${vid}: addToCart(input: { productId: ${productId}, variantId: ${vid}, quantity: 1 }) {
        cart { id }
      }
    `);

    const query = `mutation { ${mutations.join('\n')} }`;

    const response = await axios.post(
      'https://shop13134.mywebshop.io/api/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HostedShop-ApiKey': process.env.HOSTEDSHOP_API_KEY,
          'X-HostedShop-Id': process.env.HOSTEDSHOP_ID
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.listen(PORT, () => {
  console.log(`Donation proxy running on port ${PORT}`);
});
