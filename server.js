require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const Product = require('./Product')
const Item = require('./Item')

const app = express()

app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err))

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ status: 'fail', message: 'Unauthorized: Invalid or missing API Key' })
  }
  next()
}

app.get('/version', (req, res) => {
  res.json({
    "version": "1.2",
    "updatedAt": "2026-01-29"
  })
})

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find()
    res.status(200).json(items)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.status(200).json(item)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.post('/api/items', authMiddleware, async (req, res) => {
  try {
    const newItem = await Item.create(req.body)
    res.status(201).json(newItem)
  } catch (err) {
    res.status(400).json({ message: 'Validation error' })
  }
})

app.put('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true, overwrite: true })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.status(200).json(item)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.patch('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.status(200).json(item)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

app.delete('/api/items/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id)
    if (!item) return res.status(404).json({ message: 'Item not found' })
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))