require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const Product = require('./Product')

const app = express()

app.use(express.json())
app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err))

app.post('/api/products', async (req, res) => {
  try {
    const products = req.body
    const newProducts = await Product.insertMany(Array.isArray(products) ? products : [products])
    res.status(201).json({
      status: 'success',
      data: newProducts
    })
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message })
  }
})

app.get('/api/products', async (req, res) => {
  try {
    const queryObject = { ...req.query }
    const excludeFields = ['sort', 'page', 'limit', 'fields']
    excludeFields.forEach(el => delete queryObject[el])

    let query = Product.find(queryObject)

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ')
      query = query.sort(sortBy)
    } else {
      query = query.sort('-createdAt')
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ')
      query = query.select(fields)
    }

    const pageNum = parseInt(req.query.page) || 1
    const limitNum = parseInt(req.query.limit) || 10
    const skip = (pageNum - 1) * limitNum

    query = query.skip(skip).limit(limitNum)

    const products = await query
    
    res.status(200).json({
      status: 'success',
      results: products.length,
      page: pageNum,
      data: products
    })
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message })
  }
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/version', (req, res) => {
  res.json({
    "version": "1.1",
    "updatedAt": "2026-01-28"
  })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))