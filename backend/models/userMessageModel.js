import express from 'express';
import mongoose from 'mongoose';

const userMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: {type: Boolean, default: false}
}, {
    timestamps: true
})

const UserMessage = mongoose.model('UserMessage', userMessageSchema);

export default UserMessage;
