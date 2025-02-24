const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    fullName: { type: String, required: true }
});
// Method to compare passwords
studentSchema.methods.comparePassword = function(candidatePassword) {
  console.log('Comparing:', candidatePassword, 'with', this.password);
  return bcrypt.compare(candidatePassword, this.password);
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
