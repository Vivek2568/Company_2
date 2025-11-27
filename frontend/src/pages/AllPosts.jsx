import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaTags, FaMagnifyingGlass, FaXmark, FaSpinner, FaFileLines, FaChevronLeft, FaChevronRight, FaBars, FaGlobe, FaUser, FaUsers, FaFolderOpen } from 'react-icons/fa6';

const AllPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('explore'); // 'explore', 'followers', 'following', 'yourPosts'
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [tagInput, setTagInput] = useState(''); // user-entered comma-separated tags
  const [appliedTag, setAppliedTag] = useState(''); // debounced/applied tag string used for queries
  const [categories, setCategories] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterType, selectedCategories, appliedTag]);

  useEffect(() => {
    fetchPosts();
  }, [page, search, filterType, selectedCategories, appliedTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };

      if (search) params.search = search;
      if (selectedCategories.length > 0) params.categories = selectedCategories.join(',');
      if (appliedTag && appliedTag.trim()) params.tags = appliedTag;

      if (filterType === 'following' && user) {
        params.followed = true;
      } else if (filterType === 'yourPosts' && user) {
        params.author = user.id;
      }

      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.posts);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const removeTag = (tagToRemove) => {
    const list = tagInput.split(',').map(t => t.trim()).filter(Boolean).filter(t => t !== tagToRemove);
    const newInput = list.join(', ');
    setTagInput(newInput);
    // update appliedTag if it contained the removed tag
    const appliedList = appliedTag.split(',').map(t => t.trim()).filter(Boolean).filter(t => t !== tagToRemove);
    setAppliedTag(appliedList.join(', '));
  };

  // Debounce applying tagInput to appliedTag to avoid firing fetch on every keystroke
  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedTag(tagInput);
    }, 600);
    return () => clearTimeout(t);
  }, [tagInput]);

  // Apply immediately when user presses Enter in the tag input
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAppliedTag(tagInput);
    }
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setTagInput('');
    setSearch('');
    setFilterType('explore');
  };

  const filterOptions = [
    { value: 'explore', label: 'Explore All', icon: FaGlobe },
    ...(user ? [
      { value: 'yourPosts', label: 'Your Posts', icon: FaUser },
      { value: 'following', label: 'Following', icon: FaUsers }
    ] : [])
  ];

  if (loading && posts.length === 0) return <Loader />;

  return (
    <div className="min-h-screen bg-[#FFFBEB] page-bg">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-[#FFFBEB] page-bg border-b border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Discover Posts
            </h1>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
            >
              <FaBars className="text-lg" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`${
              mobileMenuOpen ? 'block' : 'hidden md:block'
            } lg:col-span-1 space-y-6`}
          >
            {/* Filter Type (minimal) */}
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FaFilter className="text-base" />
                Feed Type
              </h2>
              <div className="flex flex-col">
                {filterOptions.map(option => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterType(option.value);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left flex items-center gap-3 py-2 px-1 transition-colors ${
                        filterType === option.value
                          ? 'text-blue-600 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}>
                      <IconComponent className="text-base" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Filter (minimal) */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FaFolderOpen className="text-base" />
                Categories
              </h3>
              <div className="max-h-64 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No categories</p>
                ) : (
                  categories.map(cat => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-3 py-1 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => toggleCategory(cat._id)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Tags Filter (user input - comma separated) */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FaTags className="text-base" />
                Tags
              </h3>
              <div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Enter tags separated by comma (e.g., javascript, react)"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white card-bg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Filter posts by comma-separated tags</p>
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedCategories.length > 0 || (tagInput && tagInput.trim() !== '') || search) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg font-medium hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center justify-center gap-2"
              >
                <FaXmark className="text-lg" />
                Clear Filters
              </motion.button>
            )}
          </motion.div>

          {/* Main Content - Center */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6 pl-2 lg:pl-6"
          >
            {/* Search Bar */}
            <div className="p-0">
              <div className="w-full lg:w-1/2 max-w-md border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 flex items-center gap-2 bg-white/60 dark:bg-slate-800/60">
                <FaMagnifyingGlass className="text-slate-500 dark:text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' || e.key === 'Delete') {
                      setTimeout(() => searchInputRef.current?.focus(), 0);
                    }
                  }}
                  placeholder="Search by title or content..."
                  className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm"
                />
              </div>
            </div>

            {/* Active Filters Display */}
            <AnimatePresence>
              {(selectedCategories.length > 0 || (tagInput && tagInput.trim() !== '')) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {selectedCategories.map(catId => {
                    const cat = categories.find(c => c._id === catId);
                    return cat ? (
                      <motion.button
                        key={catId}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => toggleCategory(catId)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        {cat.name}
                        <FaXmark className="text-sm" />
                      </motion.button>
                    ) : null;
                  })}
                  {appliedTag.split(',').map(t => t.trim()).filter(Boolean).map(tagName => (
                    <motion.button
                      key={tagName}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={() => removeTag(tagName)}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      #{tagName}
                      <FaXmark className="text-sm" />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Posts Grid */}
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center py-12"
                >
                  <div className="text-center">
                    <FaSpinner className="text-5xl text-slate-400 dark:text-slate-600 animate-spin mx-auto" />
                    <p className="mt-2 text-slate-600 dark:text-slate-400">Loading posts...</p>
                  </div>
                </motion.div>
              ) : posts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-12"
                >
                  <span className="text-6xl text-slate-400 dark:text-slate-600 block mb-4">
                    <FaFileLines className="text-6xl" />
                  </span>
                  <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    No posts found
                  </h3>
                  <p className="text-slate-500 dark:text-slate-500">
                    Try adjusting your filters or search terms
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="posts"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 max-w-3xl"
                >
                  {posts.map((post, index) => (
                    <motion.div
                      key={post._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      whileHover={{ x: 4 }}
                      className="py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          {/* Author & Date */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-white uppercase">
                                {post.author.username[0]}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {post.author.username}
                            </p>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(post.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>

                          {/* Title */}
                          <Link to={`/posts/${post._id}`} className="block mb-1">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                          </Link>

                          {/* Excerpt + read more */}
                          <p className="text-base text-slate-600 dark:text-slate-400 line-clamp-3">
                            {post.excerpt || (post.content && post.content.replace(/<[^>]+>/g, '').slice(0, 220))}
                          </p>
                        </div>

                        {/* Thumbnail on right */}
                        <div className="w-28 h-20 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                          {post.images?.[0] ? (
                            <img
                              src={`http://localhost:5000/uploads/${post.images[0]}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          ) : post.thumbnail ? (
                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400"> </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2">
                        <Link to={`/posts/${post._id}`} className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          Read more
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center items-center gap-2 mt-8 flex-wrap"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  First
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Previous
                </motion.button>

                <div className="flex gap-1 flex-wrap justify-center">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    const pageNum = page > 3 ? page + i - 2 : i + 1;
                    if (pageNum > totalPages) return null;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          page === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Next
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Last
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AllPosts;
