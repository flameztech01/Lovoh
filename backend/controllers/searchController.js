// controllers/searchController.js - FIXED VERSION
import asyncHandler from 'express-async-handler';
import Article from '../models/articleModel.js';
import Magazine from '../models/magazineModel.js';
import Video from '../models/videoModel.js';
import User from '../models/userModel.js';

// @desc    Search across all content (articles, magazines, videos, users)
// @route   GET /api/search?q=query&page=1&limit=20
// @access  Public
const searchAll = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20, type } = req.query;
  
  console.log('Search request received:', { q, page, limit, type }); // Debug log
  
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ 
      message: 'Search query must be at least 2 characters long' 
    });
  }

  const searchTerm = q.trim();
  const searchRegex = new RegExp(searchTerm, 'i');
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const results = {};

  try {
    // ==================== SEARCH ARTICLES ====================
    if (!type || type === 'articles') {
      const articleQuery = {
        $or: [
          { title: { $regex: searchRegex } },
          { excerpt: { $regex: searchRegex } },
          { content: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
          { author: { $regex: searchRegex } }
        ],
        status: 'published'
      };

      const articles = await Article.find(articleQuery)
        .select('title excerpt slug featuredImage images category author authorId createdAt views likesCount status')
        .populate('authorId', 'name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const articleCount = await Article.countDocuments(articleQuery);

      results.articles = {
        items: articles.map(article => ({
          ...article,
          type: 'article',
          _id: article._id ? article._id.toString() : article._id,
          authorId: article.authorId ? {
            _id: article.authorId._id.toString(),
            name: article.authorId.name,
            username: article.authorId.username,
            profile: article.authorId.profile
          } : null,
        })),
        total: articleCount,
        page: pageNum,
        pages: Math.ceil(articleCount / limitNum)
      };
    }

    // ==================== SEARCH MAGAZINES ====================
    if (!type || type === 'magazines') {
      const magazineQuery = {
        $or: [
          { title: { $regex: searchRegex } },
          { summary: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
          { author: { $regex: searchRegex } }
        ],
        status: { $in: ['published', 'coming_soon'] }
      };

      const magazines = await Magazine.find(magazineQuery)
        .select('title summary slug coverImage category author createdBy createdAt views likesCount status comingSoon')
        .populate('createdBy', 'name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const magazineCount = await Magazine.countDocuments(magazineQuery);

      results.magazines = {
        items: magazines.map(magazine => ({
          ...magazine,
          type: 'magazine',
          _id: magazine._id ? magazine._id.toString() : magazine._id,
          createdBy: magazine.createdBy ? {
            _id: magazine.createdBy._id.toString(),
            name: magazine.createdBy.name,
            username: magazine.createdBy.username,
            profile: magazine.createdBy.profile
          } : null,
        })),
        total: magazineCount,
        page: pageNum,
        pages: Math.ceil(magazineCount / limitNum)
      };
    }

    // ==================== SEARCH VIDEOS ====================
    if (!type || type === 'videos') {
      const videoQuery = {
        $or: [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } },
          { category: { $regex: searchRegex } },
          { tags: { $in: [searchRegex] } },
          { authorName: { $regex: searchRegex } }
        ],
        status: 'published'
      };

      const videos = await Video.find(videoQuery)
        .select('title description thumbnail videoUrl category authorName authorProfile user createdAt views likesCount duration videoType')
        .populate('user', 'name username profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const videoCount = await Video.countDocuments(videoQuery);

      results.videos = {
        items: videos.map(video => ({
          ...video,
          type: 'video',
          _id: video._id ? video._id.toString() : video._id,
          user: video.user ? {
            _id: video.user._id.toString(),
            name: video.user.name,
            username: video.user.username,
            profile: video.user.profile
          } : null,
        })),
        total: videoCount,
        page: pageNum,
        pages: Math.ceil(videoCount / limitNum)
      };
    }

    // ==================== SEARCH USERS ====================
    if (!type || type === 'users') {
      const userQuery = {
        $or: [
          { name: { $regex: searchRegex } },
          { username: { $regex: searchRegex } },
          { bio: { $regex: searchRegex } }
        ],
        isVerified: true
      };

      const users = await User.find(userQuery)
        .select('name username profile bio followersCount followingCount biizzed_contributor')
        .sort({ followersCount: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const userCount = await User.countDocuments(userQuery);

      results.users = {
        items: users.map(user => ({
          ...user,
          type: 'user',
          _id: user._id ? user._id.toString() : user._id,
        })),
        total: userCount,
        page: pageNum,
        pages: Math.ceil(userCount / limitNum)
      };
    }

    // Get total counts for response
    const totalResults = 
      (results.articles?.total || 0) + 
      (results.magazines?.total || 0) + 
      (results.videos?.total || 0) + 
      (results.users?.total || 0);

    console.log('Search completed, total results:', totalResults); // Debug log

    res.json({
      query: searchTerm,
      total: totalResults,
      ...results,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'Search failed', 
      error: error.message 
    });
  }
});

// @desc    Quick search (limited results for autocomplete/suggestions)
// @route   GET /api/search/suggest?q=query&limit=5
// @access  Public
const quickSearch = asyncHandler(async (req, res) => {
  const { q, limit = 5 } = req.query;
  
  console.log('Quick search request:', { q, limit }); // Debug log
  
  if (!q || q.trim().length < 2) {
    return res.json({ suggestions: [] });
  }

  const searchTerm = q.trim();
  const searchRegex = new RegExp(searchTerm, 'i');
  const limitNum = parseInt(limit);

  const suggestions = [];

  try {
    // Get article suggestions
    const articles = await Article.find({
      $or: [
        { title: { $regex: searchRegex } },
        { excerpt: { $regex: searchRegex } }
      ],
      status: 'published'
    })
      .select('title slug featuredImage')
      .limit(limitNum)
      .lean();

    articles.forEach(article => {
      suggestions.push({
        type: 'article',
        id: article._id,
        title: article.title,
        slug: article.slug,
        image: article.featuredImage,
        url: `/articles/${article.slug}`
      });
    });

    // Get magazine suggestions
    const magazines = await Magazine.find({
      $or: [
        { title: { $regex: searchRegex } },
        { summary: { $regex: searchRegex } }
      ],
      status: 'published'
    })
      .select('title slug coverImage')
      .limit(limitNum)
      .lean();

    magazines.forEach(magazine => {
      suggestions.push({
        type: 'magazine',
        id: magazine._id,
        title: magazine.title,
        slug: magazine.slug,
        image: magazine.coverImage,
        url: `/${magazine.slug}`
      });
    });

    // Get video suggestions
    const videos = await Video.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ],
      status: 'published'
    })
      .select('title thumbnail')
      .limit(limitNum)
      .lean();

    videos.forEach(video => {
      suggestions.push({
        type: 'video',
        id: video._id,
        title: video.title,
        image: video.thumbnail,
        url: `/videos/${video._id}`
      });
    });

    // Get user suggestions
    const users = await User.find({
      $or: [
        { name: { $regex: searchRegex } },
        { username: { $regex: searchRegex } }
      ],
      isVerified: true
    })
      .select('name username profile')
      .limit(limitNum)
      .lean();

    users.forEach(user => {
      suggestions.push({
        type: 'user',
        id: user._id,
        title: user.name,
        subtitle: `@${user.username}`,
        image: user.profile,
        url: `/user/${user.username}`
      });
    });

    // Sort by relevance (title match first)
    suggestions.sort((a, b) => {
      const aTitleMatch = a.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const bTitleMatch = b.title?.toLowerCase().includes(searchTerm.toLowerCase());
      if (aTitleMatch && !bTitleMatch) return -1;
      if (!aTitleMatch && bTitleMatch) return 1;
      return 0;
    });

    res.json({ suggestions: suggestions.slice(0, limitNum * 2) });
  } catch (error) {
    console.error('Quick search error:', error);
    res.json({ suggestions: [] });
  }
});

export {
  searchAll,
  quickSearch
};