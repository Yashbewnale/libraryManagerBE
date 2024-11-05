const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const xlsx = require('xlsx');
const { authenticateAdmin } = require('./services/authService');
const { registerAdmin } = require('./services/userRegistration.js');
const Book = require('./models/book.model.js');
const path = require('path');

const user = require('./models/user.model.js');

const app = express();

app.use(express.json());
app.use(cors())

mongoURI = 'mongodb+srv://ybewnale:Yash413521@cluster0.koklh.mongodb.net/BookProject?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(mongoURI)
.then(() => {
    console.log('Connected to db');

    app.listen(3000, () => {
        console.log('connected to port 3000');
    });

}).catch(error => {
    console.error('Error', error);
})

app.get('/', (req, res) => {
    res.send('Hello world!!');
});

app.post('/adminLogin', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    authenticateAdmin(username, password, res);
})

app.post('/registerAdmin', async (req, res) => {
    console.log('REQ',req.body);
    const { username, password } = req.body;

    registerAdmin(username, password, res);
});

// Endpoint to upload books from an Excel file
app.post('/uploadBooks', upload.single('file'), async (req, res) => {
    try {
        // Check if the uploaded file is an Excel file (only .xlsx or .xls)
        const fileExtension = path.extname(req.file.originalname).toLowerCase();
        if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
            return res.status(400).json({ error: 'Invalid file format. Please upload an Excel file.' });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const booksData = xlsx.utils.sheet_to_json(sheet);

        // Map the data and insert it into MongoDB
        const books = booksData.map(data => ({
            bookName: data.bookName,
            author: data.author,
            quantity: data.quantity || 0  // Set default quantity to 0 if missing
        }));

        await Book.insertMany(books);
        res.status(200).json({ message: 'Books uploaded successfully!' });
    } catch (error) {
        console.error('Error uploading books:', error);
        res.status(500).json({ error: 'Failed to upload books' });
    }
});
  
  // Endpoint to retrieve books with pagination
  app.get('/getBooks', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  
    try {
      const books = await Book.find()
        .skip((page - 1) * limit)
        .limit(limit);
  
      const total = await Book.countDocuments();
  
      res.status(200).json({
        books,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to retrieve books' });
    }
  });