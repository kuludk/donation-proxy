const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- Donation options route ---
app.get('/api/donation-options', async (req, res) => {
  try {
    // Example: fetch product variants from HostedShop GraphQL
    const query = `
      {
        products {
          id
          title
          variants {
            id
            title
          }
        }
      }
    `;

    const response = await axios.post(
      'https://shop13134.mywebshop.io/api/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HostedShop-ApiKey': process.env.HOSTEDSHOP_API_KEY,
          'X-HostedShop-Id': process.env.HOSTEDSHOP_ID,
        },
      }
    );

    // You can shape the data here however you like
    res.json(response.data.data);
  } catch (err) {
    console.error('Error fetching donation options:', err.message);
    res.status(500).json({ error: 'Failed to fetch donation options' });
  }
});

// --- Old add-to-cart route (still here if you need it) ---
app.post('/api/add-to-cart', async (req, res) => {
  const { productId, variantIds } = req.body;

  try {
    const mutations = variantIds.map(
      (vid, i) => `
        addToCart${i}: addToCart(input: { productId: ${productId}, variantId: ${vid}, quantity: 1 }) {
          cart { id checkoutUrl }
        }
      `
    );

    const query = `mutation { ${mutations.join('\n')} }`;

    const response = await axios.post(
      'https://shop13134.mywebshop.io/api/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HostedShop-ApiKey': process.env.HOSTEDSHOP_API_KEY,
          'X-HostedShop-Id': process.env.HOSTEDSHOP_ID,
        },
      }
    );

    res.json(response.data.data);
  } catch (err) {
    console.error('Error adding to cart:', err.message);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// --- New create-donation route (the fix!) ---
app.post('/api/create-donation', async (req, res) => {
  const { productId, variantIds } = req.body;

  try {
    const mutations = variantIds.map(
      (vid, i) => `
        addToCart${i}: addToCart(input: { productId: ${productId}, variantId: ${vid}, quantity: 1 }) {
          cart { id checkoutUrl }
        }
      `
    );

    const query = `mutation { ${mutations.join('\n')} }`;

    const response = await axios.post(
      'https://shop13134.mywebshop.io/api/graphql',
      { query },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-HostedShop-ApiKey': process.env.HOSTEDSHOP_API_KEY,
          'X-HostedShop-Id': process.env.HOSTEDSHOP_ID,
        },
      }
    );

    // Grab checkoutUrl from the first addToCart mutation
    const checkoutUrl =
      response.data?.data?.addToCart0?.cart?.checkoutUrl ||
      response.data?.data?.addToCart?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      throw new Error('No checkoutUrl returned from HostedShop');
    }

    res.json({ checkoutUrl });
  } catch (err) {
    console.error('Error creating donation order:', err.message);
    res.status(500).json({ error: 'Failed to create donation order' });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
