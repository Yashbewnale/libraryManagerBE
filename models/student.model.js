const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    fullName: { type: String, required: true },
    // assignedBooks: [
    //     {
    //         bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }, // Reference to the Book model
    //         assignedDate: { type: Date, default: Date.now },
    //         returnDate: { type: Date, required: false } // Optional field for return date
    //     }
    // ]
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
