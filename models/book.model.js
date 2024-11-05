// models/book.model.js

const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookName: String,
  author: String,
  quantity: Number
});

module.exports = mongoose.model('Book', bookSchema);
