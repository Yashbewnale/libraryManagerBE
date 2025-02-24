const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '1234567890';
const bcrypt = require('bcrypt'); 
const Student = require('../models/student.model');

// Function to authenticate an admin user
async function authenticateUser(username, password, isAdmin, res) {
    try {
      let user;
      if(isAdmin){
        user = await User.findOne({ username });
      }else{
        user = await Student.findOne({ username });
      }
  
      if (!user) {
        console.log('Not authorized.');
        res.send("{ success: false, message: 'Not authorized' }");
        return;
      }
  
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Invalid credentials.');
        res.send("{ success: false, message: 'Invalid credentials' }");
        return 
      }


    // Generate JWT token
    const authToken = jwt.sign(
        { id: user._id, username: user.username, isAdmin: isAdmin }, // Payload (user data)
        JWT_SECRET, // Secret key
        { expiresIn: '6h' } // Token expiration
      );
  
      res.json({ success: true, token: authToken, username: user.username, fullName:user?.fullName, isAdmin: isAdmin });
      return;
    } catch (error) {
      console.error('Error during authentication:', error);
      res.send("{ success: false, message: 'Error during authentication' }");
      return; 
    }
  }
  

  module.exports = {
    authenticateUser,
  }