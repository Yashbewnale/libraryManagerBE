const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, reuired: true },
  email: { type: String, required: false},
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  console.log('Comparing:', candidatePassword, 'with', this.password);
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;