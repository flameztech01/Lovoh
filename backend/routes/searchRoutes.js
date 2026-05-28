// routes/searchRoutes.js
import express from 'express';
import { searchAll, quickSearch } from '../controllers/searchController.js';

const router = express.Router();

// Public search routes
router.get('/', searchAll);           // Main search endpoint
router.get('/suggest', quickSearch);  // Quick suggestions for autocomplete

export default router;