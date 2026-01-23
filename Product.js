const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, default: 4.5 },
  company: { type: String, required: true }
});

module.exports = mongoose.model('Product', productSchema);