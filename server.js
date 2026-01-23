const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const Product = require('./Product');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

app.get('/api/products', async (req, res) => {
  try {
    // 1. FILTERING
    const queryObject = { ...req.query };
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObject[el]);

    let query = Product.find(queryObject);

    // 2. SORTING
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 3. FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    // 4. PAGINATION (Task 11)
    const pageNum = parseInt(req.query.page) || 1;
    const limitNum = parseInt(req.query.limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    query = query.skip(skip).limit(limitNum);

    const products = await query;
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      page: pageNum,
      data: products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));