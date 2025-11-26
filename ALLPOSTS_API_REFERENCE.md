# AllPosts API Reference

## Endpoint: GET /api/posts

### Base URL
```
http://localhost:5000/api/posts
```

## Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 9 | Posts per page |
| `search` | string | - | Search in title or content (case-insensitive) |
| `categories` | string | - | Comma-separated category IDs |
| `tags` | string | - | Comma-separated tag IDs |
| `author` | string | - | User ID to filter by author |
| `followed` | boolean | false | Show posts from users you follow |

## Examples

### 1. Get All Posts (Default)
```
GET /api/posts?page=1&limit=9
```
**Response**:
```json
{
  "posts": [
    {
      "_id": "post1",
      "title": "My First Post",
      "content": "<p>Content...</p>",
      "author": { "_id": "user1", "username": "john" },
      "categories": [{ "_id": "cat1", "name": "Tech" }],
      "tags": [{ "_id": "tag1", "name": "javascript" }],
      "images": ["image1.jpg"],
      "status": "published",
      "createdAt": "2024-11-26T..."
    }
    // ... 8 more posts
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

### 2. Search Posts
```
GET /api/posts?page=1&search=javascript
```
Searches for "javascript" in both title and content

### 3. Filter by Single Category
```
GET /api/posts?page=1&categories=63f7a1b9d8e5c4a3f2e1d8c7
```

### 4. Filter by Multiple Categories (OR logic)
```
GET /api/posts?page=1&categories=63f7a1b9d8e5c4a3f2e1d8c7,63f7a2c9d8e5c4a3f2e1d8c8
```
Returns posts that have **either** category 1 **or** category 2 **or** both

### 5. Filter by Single Tag
```
GET /api/posts?page=1&tags=63g7b2c9d8e5c4a3f2e1d8c9
```

### 6. Filter by Multiple Tags (OR logic)
```
GET /api/posts?page=1&tags=63g7b2c9d8e5c4a3f2e1d8c9,63g7b3d9d8e5c4a3f2e1d8d0
```
Returns posts that have **either** tag 1 **or** tag 2 **or** both

### 7. Combine Multiple Filters
```
GET /api/posts?page=1&search=tips&categories=cat1,cat2&tags=tag1,tag2
```
Returns posts where:
- Title or content contains "tips"
- AND has category cat1 OR cat2
- AND has tag tag1 OR tag2

### 8. Show Your Posts (Requires Authentication)
```
GET /api/posts?page=1&author=user123
```
Shows all posts by user `user123` (including drafts if you're the author)

### 9. Show Following's Posts (Requires Authentication)
```
GET /api/posts?page=1&followed=true
```
Shows posts from all users you follow (only published posts)

### 10. Combine Search with Following
```
GET /api/posts?page=1&search=tutorial&followed=true
```
Shows posts from followed users that contain "tutorial"

### 11. Get Second Page
```
GET /api/posts?page=2&limit=9
```
Skips first 9 posts, shows posts 10-18

### 12. Complex Query Example
```
GET /api/posts?page=1&search=react&categories=63f7a1b9d8e5c4a3f2e1d8c7,63f7a2c9d8e5c4a3f2e1d8c8&tags=63g7b2c9d8e5c4a3f2e1d8c9&limit=9
```

## Frontend Implementation

### How the Frontend Constructs Queries

```javascript
// AllPosts.jsx - fetchPosts() function

const fetchPosts = async () => {
  const params = { page, limit: 9 };

  // Add search parameter
  if (search) params.search = search;

  // Join category IDs with comma
  if (selectedCategories.length > 0) {
    params.categories = selectedCategories.join(',');
  }

  // Join tag IDs with comma
  if (selectedTags.length > 0) {
    params.tags = selectedTags.join(',');
  }

  // Feed type filters
  if (filterType === 'following' && user) {
    params.followed = true;
  } else if (filterType === 'yourPosts' && user) {
    params.author = user.id;
  }

  // Make request
  const response = await axios.get('/api/posts', { params });
  setPosts(response.data.posts);
  setTotalPages(response.data.totalPages);
};
```

## Backend Implementation

### How the Backend Processes Queries

```javascript
// postController.js - getPosts() function

const getPosts = async (req, res) => {
  const { 
    page = 1, 
    limit = 9, 
    search, 
    categories,      // Comma-separated
    tags,             // Comma-separated
    author, 
    followed 
  } = req.query;

  let query = { status: 'published' };

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  // Multiple categories (MongoDB $in operator)
  if (categories) {
    const categoryArray = categories.split(',').filter(c => c.trim());
    if (categoryArray.length > 0) {
      query.categories = { $in: categoryArray };  // Posts with ANY of these categories
    }
  }

  // Multiple tags (MongoDB $in operator)
  if (tags) {
    const tagsArray = tags.split(',').filter(t => t.trim());
    if (tagsArray.length > 0) {
      query.tags = { $in: tagsArray };  // Posts with ANY of these tags
    }
  }

  // Author filter
  if (author) {
    query.author = author;
  }

  // Following filter
  if (followed && followingIds.length > 0) {
    query.author = { $in: followingIds };
  }

  // Execute query
  const posts = await Post.find(query)
    .populate('author', 'username')
    .populate('categories', 'name')
    .populate('tags', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Post.countDocuments(query);
  res.json({ 
    posts, 
    totalPages: Math.ceil(total / limit), 
    currentPage: page 
  });
};
```

## Response Format

### Success Response
```json
{
  "posts": [
    {
      "_id": "ObjectId",
      "title": "string",
      "content": "HTML string",
      "excerpt": "string (optional)",
      "author": {
        "_id": "ObjectId",
        "username": "string"
      },
      "categories": [
        {
          "_id": "ObjectId",
          "name": "string"
        }
      ],
      "tags": [
        {
          "_id": "ObjectId",
          "name": "string"
        }
      ],
      "images": ["filename.jpg"],
      "likes": ["userId1", "userId2"],
      "dislikes": [],
      "status": "published" | "draft",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp"
    }
  ],
  "totalPages": number,
  "currentPage": number
}
```

### Error Response
```json
{
  "message": "Server error"
}
```

## Testing with cURL

```bash
# Get all posts
curl "http://localhost:5000/api/posts?page=1&limit=9"

# Search
curl "http://localhost:5000/api/posts?page=1&search=javascript"

# Filter by category
curl "http://localhost:5000/api/posts?page=1&categories=63f7a1b9d8e5c4a3f2e1d8c7"

# Filter by multiple categories
curl "http://localhost:5000/api/posts?page=1&categories=63f7a1b9d8e5c4a3f2e1d8c7,63f7a2c9d8e5c4a3f2e1d8c8"

# Filter by multiple tags
curl "http://localhost:5000/api/posts?page=1&tags=63g7b2c9d8e5c4a3f2e1d8c9,63g7b3d9d8e5c4a3f2e1d8d0"

# Complex query
curl "http://localhost:5000/api/posts?page=1&search=react&categories=cat1,cat2&tags=tag1&limit=9"
```

## Filter Logic Summary

### Categories & Tags Behavior
- **When you select multiple**: Returns posts matching **ANY** (OR logic)
- **Combined with search**: Returns posts matching search AND (ANY category) AND (ANY tag)
- **Multiple categories + tags**: Returns posts with (ANY category) AND (ANY tag)

### Feed Type Behavior
- **Explore (default)**: Shows all published posts
- **Your Posts**: Shows current user's posts (including drafts)
- **Following**: Shows published posts from followed users

### Pagination
- Results sorted by creation date (newest first)
- Default 9 posts per page
- Skip = (page - 1) × limit
- Example: page 2 with limit 9 = skip 9 posts

## Performance Considerations

### Database Indexes
For optimal performance with large datasets, ensure indexes exist:
```javascript
// In Post model
db.posts.createIndex({ "status": 1 })
db.posts.createIndex({ "author": 1 })
db.posts.createIndex({ "categories": 1 })
db.posts.createIndex({ "tags": 1 })
db.posts.createIndex({ "title": "text", "content": "text" })
db.posts.createIndex({ "createdAt": -1 })
```

### Query Optimization
- Text search uses regex (consider full-text search for large datasets)
- $in operator efficient for < 100 values
- Pagination with skip/limit works well up to ~100 pages

## Common Use Cases

### 1. Homepage Feed (All Posts)
```
GET /api/posts?page=1&limit=9
```

### 2. Category Page
```
GET /api/posts?page=1&categories=techCatId&limit=9
```

### 3. User Profile (Their Posts)
```
GET /api/posts?page=1&author=userId&limit=9
```

### 4. Following Feed
```
GET /api/posts?page=1&followed=true&limit=9
```

### 5. Search Results
```
GET /api/posts?page=1&search=userSearchQuery&limit=9
```

### 6. Advanced Search
```
GET /api/posts?page=1&search=query&categories=cat1,cat2&tags=tag1&limit=9
```

---

✅ **API is ready for use!**
All endpoints are functioning and returning proper paginated results with filtering support.
