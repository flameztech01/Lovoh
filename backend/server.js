import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import cookieParser from 'cookie-parser';
import {errorHandler, notFound} from './middleware/errorMiddleware.js';
import logger from './middleware/logger.js';
import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://lovoh-1.onrender.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/app', userRoutes);

// if(process.env.NODE_ENV === 'production') {
//     const __dirname = path.resolve();
    
//     // Serve static files
//     app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
//     // Simple catch-all - NO * symbol
//     app.use((req, res) => {
//         res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
//     });
// } else {
//     app.get('/', (req, res) => res.send('Server is Ready'));
// }

// Middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
mongoose
.connect(MONGO_URL)
.then(()=> {
    console.log('MongoDB connected');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});