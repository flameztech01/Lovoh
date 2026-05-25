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
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import magRoutes from './routes/magRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import formRoutes from './routes/formRoutes.js';
import adRoutes from './routes/adRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import contributorRoutes from './routes/contributorRoutes.js';
import CustomFormRoutes from './routes/customFormRoutes.js';
import sellerRoutes from "./routes/sellerRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import subscribeRoutes from "./routes/subscribeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:2000',
        'http://localhost:1000',
        'https://lovoh-1.onrender.com',
        'https://lovohcreate.vercel.app',
        'https://www.lovohcreate.com',
        'https://lovohcreate.com',
        'https://biizzed.lovohcreate.com',
        'https://uduua.lovohcreate.com',
        'https://eventroom.lovohcreate.com',
        'https://localhost',
        'capacitor://localhost',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));




app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);

app.get("/", (req, res) => {
  res.send("Teens Connect API is running 🚀");
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/magazine', magRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/contributor', contributorRoutes);
app.use('/api/custom-forms', CustomFormRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/subscribe", subscribeRoutes);
app.use("/api/notifications", notificationRoutes);

app.get('/api/fix-admin-types', async (req, res) => {
  const Article = (await import('./models/articleModel.js')).default;
  
  // Update articles where author is a known admin name
  const result = await Article.updateMany(
    { authorType: { $ne: 'admin' } },
    { $set: { authorType: 'user' } }
  );
  
  // Get all articles to check
  const all = await Article.find({}).select('title author authorType createdBy').lean();
  
  res.json({ 
    updated: result.modifiedCount,
    samples: all.slice(0, 10).map(a => ({
      title: a.title?.substring(0, 30),
      author: a.author,
      authorType: a.authorType,
      createdBy: a.createdBy?.toString()
    }))
  });
});

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