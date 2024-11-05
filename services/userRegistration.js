const express = require('express');
const User = require('../models/user.model')
const bcrypt = require('bcrypt'); 

// const app = express();


// Registration Route
async function registerAdmin(username, password, res){
    try {
        console.log(username, password);
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            // return res.status(400).json({ message: 'User already exists' });
            console.log('User already exists');
            res.send("{error: true, message: 'user already exists'}")
            return;
        }
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Create a new user
        const user = new User({
            username,
            password: hashedPassword
        });
        
        await user.save();
        console.log('User registered successfully')
        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
        // console.log('Error', error);

    }  
};

module.exports = {
    registerAdmin,
}
