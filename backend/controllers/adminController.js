import express from 'express';
import Admin from '../models/adminModel.js';
import UserMessage from '../models/userMessageModel.js';
import asyncHandler from 'express-async-handler';
import  generateToken from '../utils/generateToken.js';

//Get all users messages
const getUserMessage = asyncHandler(async (req, res) => {
    const messages = await UserMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
});

//Get Single Message
const getOneMessage = async (req, res, next) => {
    const id = req.params.id;
    const Omessage = await UserMessage.findById(id);

    if(!Omessage) {
        res.status(404);
        throw new Error('Blog not found');
    }

    res.status(200).json(Omessage);
}

// Mark a message as read
const markMessageAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await UserMessage.findById(id);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.read = true;
  await message.save();

  res.status(200).json({ message: 'Message marked as read', updatedMessage: message });
});


//Delete user message
const deleteUserMessage = asyncHandler(async (req, res) => {
    const message = await UserMessage.findById(req.params.id);
    if (message) {
        await message.remove();
        res.json({ message: 'Message removed' });
    } else {
        res.status(404);
        throw new Error('Message not found');
    }
});

//Login admin/set token
const authAdmin  = asyncHandler (async (req, res, next) => {
    const {email, password} =  req.body;
    const admin = await Admin.findOne({email});

    if(admin && (await admin .matchPassword(password))) {
        const token = generateToken (res, admin._id);
        res.status(200).json({
            id: admin._id,
            username: admin.username,
            email: admin.email,
            token,
        })
    } else{
        res.status(400)
        throw new Error('Invalid Email or password')
    }
});

//Signup new admin
const registerAdmin = asyncHandler (async (req, res, next) => {
    const {username, email, password} =  req.body;
    const adminExists = await Admin.findOne({email});

    if(adminExists) {
        res.status(400)
        throw new Error('Admin already exists')
    }

    const admin = await Admin.create({
        username,
        email,
        password
    });
   if (admin) {
       generateToken(res, admin._id);
       res.status(201).json({
           id: admin._id,
           username: admin.username,
           email: admin.email
       });
   } else {
    res.status(400);
    throw new Error('Invalid admin data');
   }
});

// Logout admin
const logoutAdmin = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
     httpOnly: true,
     expires: new Date(0),
    });
    res.status(200).json({ message: 'Admin logged out' });
});

export { getUserMessage, getOneMessage, markMessageAsRead, deleteUserMessage, authAdmin, registerAdmin, logoutAdmin };