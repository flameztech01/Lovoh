import mongoose from 'mongoose';

const storySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      required: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],
    readTime: {
      type: String,
      default: '5 min read',
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    featuredAt: {
      type: Date,
    },
    author: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
storySchema.index({ title: 'text', subtitle: 'text', content: 'text', tags: 'text' });

// Virtual for story URL
storySchema.virtual('url').get(function () {
  return `/magazine/story/${this.slug}`;
});

// Method to get related stories
storySchema.methods.getRelatedStories = async function (limit = 3) {
  return this.model('Story').find({
    _id: { $ne: this._id },
    status: 'published',
    $or: [
      { category: this.category },
      { tags: { $in: this.tags } },
    ],
  })
    .limit(limit)
    .select('title slug excerpt category readTime images');
};

const Story = mongoose.model('Story', storySchema);

export default Story;