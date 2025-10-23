import express from 'express';
import mongoose from 'mongoose';
import userMessage from '../models/userMessageModel.js';
import asyncHandler from 'express-async-handler';

const postMessage = asyncHandler (async (req, res, next) => {
    const { name, email, subject, message} = req.body;

    if(!name || !email || !subject || !message){
        res.status(400);
        throw new Error('Input all Fields')
    };

    const messages = await userMessage.create({
        name, email, subject, message,
    });

    res.status(201).json(messages);
});

export {postMessage};