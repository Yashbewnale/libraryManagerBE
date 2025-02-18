const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  total: { type: Number, required: true },
  assigned: { type: Number, default: 0 },
  available: { type: Number, default: 0 }
});

module.exports = mongoose.model('Book', bookSchema);
