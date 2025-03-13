const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const xlsx = require('xlsx');
const { authenticateUser } = require('./services/authService');
const { registerUser } = require('./services/userRegistration.js');
const Book = require('./models/book.model.js');
const path = require('path');

const user = require('./models/user.model.js');
const Student = require('./models/student.model.js');
const Assignment = require('./models/assignments.model.js');

const app = express();

app.use(express.json());
app.use(cors())

// mongoURI = 'mongodb+srv://ybewnale:Yash413521@cluster0.koklh.mongodb.net/BookProject?retryWrites=true&w=majority&appName=Cluster0'
mongoURI = 'mongodb+srv://yashbewnale0981:9e03cXLOQfzQf0Ce@cluster0.nopks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

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

app.post('/userLogin', async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let isAdmin = req.body.isAdmin;

  authenticateUser(username, password, isAdmin, res);
})

app.post('/registerUser', async (req, res) => {
  console.log('REQ', req.body);
  const { username, password, fullName, email, phone, isAdmin } = req.body;

  registerUser(username, password, fullName, email, phone, isAdmin, res);
});

app.get('/allStudents', async (req, res) => {
  try {
    // only find students with assignedBooks array as empty, i.e., no books assigned
    const students = await Student.find();

    res.json(students);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// search students by fullName with space
app.get('/searchStudent/:fullName', async (req, res) => {
  const fullName = req.params.fullName;

  try {
    const students = await Student.find({
      fullName: { $regex: fullName, $options: 'i' } // 'i' for case-insensitive
    });

    if (students.length === 0) {
      return res.status(200).json({ students: [] });
    }

    res.status(200).json({
      students
    });
  } catch (error) {
    console.error('Error searching for student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// deleteStudent by id
app.delete('/deleteStudent/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    const student = await Student
      .findOneAndDelete({ _id: studentId });
      res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// BOOKS

// Endpoint to upload books from an Excel file
app.post('/uploadBooks', upload.single('file'), async (req, res) => {
  try {
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
      return res.status(400).json({ error: 'Invalid file format. Please upload an Excel file.' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const booksData = xlsx.utils.sheet_to_json(sheet);

    const errors = [];

    for (let i = 0; i < booksData.length; i++) {
      const data = booksData[i];
      const isbn = data.isbn && String(data.isbn).trim().toLowerCase();
      const bookName = data.bookName && data.bookName.trim();
      const author = data.author && data.author.trim();
      const quantity = data.quantity;

      if (!isbn || !bookName || !author || quantity == null) {
        errors.push({ row: i + 1, error: 'Missing required fields' });
        continue; // Skip books with missing required fields
      }

      const existingBook = await Book.findOne({ isbn });

      if (existingBook) {
        // Update existing book if it already exists
        existingBook.total += quantity;   // Add to total count
        existingBook.available += quantity; // Add to available count
        await existingBook.save();
      } else {
        // Insert new book if not found
        const newBook = new Book({
          bookName: bookName,
          author: author,
          isbn: isbn,
          total: quantity,      // Set total count
          assigned: 0,          // Initial assigned count
          available: quantity   // Set available count
        });
        await newBook.save();
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Some books could not be uploaded', errors });
    }

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

// Endpoint for assigning a book to a student
app.post('/assignBook', async (req, res) => {
  const { isbn, studentId, dueDate, studentUsername } = req.body;

  try {
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if enough books are available for assignment
    if (book.available < 1) {
      return res.status(400).json({ error: 'No available copies to assign' });
    }

    const isAssigned = await Assignment.findOne({ studentId });
    if (isAssigned) {
      return res.status(400).json({ error: 'Book already assigned to student' });
    }

    const assignment = new Assignment({
      studentId,
      bookId: book._id,
      isbn: isbn,
      assignedDate: new Date(),
      returnDate: dueDate,
      studentUsername: studentUsername
    });

    await assignment.save();

    book.assigned += 1;
    book.available -= 1;

    await book.save();
    res.status(200).json({ message: 'Book assigned successfully' });

  } catch (error) {
    console.error('Error assigning book:', error);
    res.status(500).json({ error: 'Failed to assign book' });
  }
});

// Endpoint for returning a book
app.post('/returnBook', async (req, res) => {
  const { isbn, studentId } = req.body;

  try {
    const book = await Book.findOne({ isbn });

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Ensure that the student has already been assigned this book (check assignment record)
    // Assuming you have a method to validate the student's book assignment, like:
    // const assignment = await Assignment.findOne({ studentId, isbn });

    // Update the assigned and available counts
    book.assigned -= 1;
    book.available += 1;

    await book.save();  // Save the updated book data

    // Remove the assignment record
    await Assignment.deleteOne({ studentId });
    res.status(200).json({ message: 'Book returned successfully' });

  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Failed to return book' });
  }
});


// to get book(s) assigned to a student
app.get('/searchStudentForBooks/:username', async (req, res) => {
  const studentUsername = req.params.username;

  try {
    const student = await Assignment.findOne({ studentUsername })
    .populate('bookId');

    if (!student) {
      return res.status(404).json({ message: 'No books assigned to student.' });
    }

    res.status(200).json({
      res: student
    });

  } catch (error) {
    console.error('Error searching for student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/assignedBooks', async (req, res) => {
  try {
    // Fetch all assignments and populate studentId and bookId
    const assignedBooks = await Assignment.find()
      .populate('studentId')
      .populate('bookId')
      .sort({ returnDate: 1 }); // Sort by earliest returnDate first

    return res.json(assignedBooks);
  } catch (error) {
    console.error('Error fetching assigned books:', error);
    res.status(500).json({ error: 'Failed to fetch assigned books' });
  }
});



// for search book by isbn
app.get('/searchBook', async (req, res) => {
  
  const isbn = req.query.isbn;

  // Remove hyphens from the search query
  const sanitizedIsbn = isbn.replace(/-/g, '');

  try {
    // Return book if it contains parts of the isbn
    const books = await Book.find({
      isbn: { $regex: sanitizedIsbn, $options: 'i' } // 'i' for case-insensitive
    });

    if (books.length === 0) {
      return res.status(200).json({ books: [] });
    }

    res.status(200).json({
      books
    });
  } catch (error) {
    console.error('Error searching for book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/searchAssignedBook', async (req, res) => {
  
  const isbn = req.query.isbn;

  // Remove hyphens from the search query
  const sanitizedIsbn = isbn.replace(/-/g, '');

  try {
    // Return book if it contains parts of the isbn
    const books = await Assignment.find({
      isbn: { $regex: sanitizedIsbn, $options: 'i' } // 'i' for case-insensitive
    }).populate('studentId')
    .populate('bookId')
    ;

    if (books.length === 0) {
      return res.status(200).json({ books: [] });
    }
    
    res.status(200).json({
      books
    });
  } catch (error) {
    console.error('Error searching for book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete book by isbn
app.delete('/deleteBook', async (req, res) => {
  const isbn = req.query.isbn;

  try {
    const book = await Book
      .findOneAndDelete({ isbn });
      res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
);

