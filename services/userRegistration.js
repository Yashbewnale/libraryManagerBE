const express = require('express');
const User = require('../models/user.model')
const bcrypt = require('bcrypt'); 
const Student = require('../models/student.model');

// const app = express();


// Registration Route
async function registerUser(username, password, fullName, email, phone, isAdmin, res){
    try {
        console.log(username, password);
        // Check if user already exists
        const existingUser = '';
        if(isAdmin){
            this.existingUser = await User.findOne({ username });
        }else{
            this.existingUser = await Student.findOne({ username });
        }
        if (this.existingUser) {
            // return res.status(400).json({ message: 'User already exists' });
            console.log('User already exists');
            res.send("{error: true, message: 'user already exists'}")
            return;
        }
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        if(isAdmin){

            // Create a new user
            const user = new User({
                username,
                password: hashedPassword,
                isAdmin,
                email
            });
            
            await user.save();
            console.log('User registered successfully')
            return res.status(201).json({ message: `${isAdmin ? 'Admin' : 'Student'} registered successfully` });
        } else {
            // Register as Student
            const student = new Student({
                username,
                password: hashedPassword,
                email,
                phone,
                fullName,
                assignedBooks: [] // Initially no books are assigned
            });

            await student.save();
            console.log('Student registered successfully');
            return res.status(201).json({ message: 'Student registered successfully' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
        // console.log('Error', error);

    }  
};

module.exports = {
    registerUser,
}
