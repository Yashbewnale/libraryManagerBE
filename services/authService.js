const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const JWT_SECRET = '1234567890';

// Function to authenticate an admin user
async function authenticateAdmin(username, password, res) {
    try {
      const user = await User.findOne({ username });
  
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
        { id: user._id, username: user.username }, // Payload (user data)
        JWT_SECRET, // Secret key
        { expiresIn: '6h' } // Token expiration
      );
  
  
      console.log('Admin authenticated successfully.');
      res.json({ success: true, token: authToken });
      return;
      // Add further logic here if needed
    } catch (error) {
      console.error('Error during authentication:', error);
      res.send("{ success: false, message: 'Error during authentication' }");
      return; 
    }
  }
  

  module.exports = {
    authenticateAdmin,
  }