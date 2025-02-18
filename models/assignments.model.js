const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnDate: { type: Date, default: null },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
