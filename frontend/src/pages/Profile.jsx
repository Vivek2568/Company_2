import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaEye, FaUser, FaUsers, FaPen, FaTrash, FaXmark, FaArrowRightFromBracket, FaPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';


const Profile = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchFollowers();
      fetchFollowing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get('/api/posts', { params: { author: user.id, limit: 100 } });
      const posts = response.data.posts || [];
      const commentCounts = {};
      await Promise.all(posts.map(async (post) => {
        try {
          const res = await axios.get(`/api/comments/${post._id}`);
          commentCounts[post._id] = Array.isArray(res.data) ? res.data.length : 0;
        } catch {
          commentCounts[post._id] = 0;
        }
      }));
      const postsWithComments = posts.map(post => ({
        ...post,
        commentsCount: commentCounts[post._id] || 0
      }));
      setPosts(postsWithComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    } catch (error) {
      setPosts([]);
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`/api/users/${user.id}/followers`);
      setFollowers(res.data);
    } catch {
      setFollowers([]);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get(`/api/users/${user.id}/following`);
      setFollowing(res.data);
    } catch {
      setFollowing([]);
    }
  };

  // Calculate analytics
  const calculateAnalytics = () => {
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
    const avgLikesPerPost = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    const avgCommentsPerPost = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
    const topPost = posts.length > 0 ? posts.reduce((max, p) => (p.likes?.length || 0) > (max.likes?.length || 0) ? p : max) : null;
    
    return { totalViews, totalLikes, totalComments, avgLikesPerPost, avgCommentsPerPost, topPost };
  };

  const handleDeletePost = async (postId) => {
    try {
      await axios.delete(`/api/posts/${postId}`);
      toast.success('Post deleted successfully');
      fetchUserPosts();
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Error deleting post');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <Loader />;

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Hero Section - Compact */}
      <div className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            {/* Left: Avatar & Basic Info */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky top-8"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center mb-3 overflow-hidden border-2 border-slate-200">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-xl font-serif font-bold text-slate-900 mb-0.5">{user.username}</h1>
                <p className="text-slate-600 text-xs mb-3 truncate">{user.email}</p>
                
                <div className="flex flex-col gap-1.5">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/create-post')}
                    className="w-full px-3 py-1.5 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-1"
                  >
                    <FaPlus className="text-xs" /> New
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="w-full px-3 py-1.5 bg-slate-100 text-slate-900 rounded-full font-semibold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <FaArrowRightFromBracket className="text-xs" /> Out
                  </motion.button>
                </div>
              </motion.div>
            </div>

            {/* Right: Stats - Compact */}
            <div className="md:col-span-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {/* Total Posts */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 transition text-center"
                >
                  <div className="text-2xl font-bold text-slate-900">{posts.length}</div>
                  <div className="text-xs text-slate-600 mt-0.5">Posts</div>
                </motion.div>

                {/* Followers */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 hover:shadow-sm transition cursor-pointer group text-center"
                  onClick={() => { setShowFollowers(true); setShowFollowing(false); }}
                >
                  <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">{followers.length}</div>
                  <div className="text-xs text-slate-600 mt-0.5 group-hover:text-slate-900 transition">Followers</div>
                </motion.div>

                {/* Following */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 hover:shadow-sm transition cursor-pointer group text-center"
                  onClick={() => { setShowFollowing(true); setShowFollowers(false); }}
                >
                  <div className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition">{following.length}</div>
                  <div className="text-xs text-slate-600 mt-0.5 group-hover:text-slate-900 transition">Following</div>
                </motion.div>

                {/* Likes Stat */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 transition text-center"
                >
                  <div className="text-2xl font-bold text-red-500">{analytics.totalLikes}</div>
                  <div className="text-xs text-slate-600 mt-0.5">Claps</div>
                </motion.div>

                {/* Comments Stat */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 transition text-center"
                >
                  <div className="text-2xl font-bold text-blue-500">{analytics.totalComments}</div>
                  <div className="text-xs text-slate-600 mt-0.5">Comments</div>
                </motion.div>

                {/* Views Stat */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 transition text-center"
                >
                  <div className="text-2xl font-bold text-green-600">{analytics.totalViews}</div>
                  <div className="text-xs text-slate-600 mt-0.5">Views</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowers && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFollowers(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-slate-900">Followers</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFollowers(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <FaXmark className="text-slate-600" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {followers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <FaUser className="text-4xl text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">No followers yet</p>
                    <p className="text-slate-500 text-sm mt-1">Share great content to gain followers</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {followers.map((f) => (
                      <motion.div
                        key={f._id}
                        whileHover={{ backgroundColor: '#f8fafc' }}
                        onClick={() => {
                          navigate(`/users/${f._id}`);
                          setShowFollowers(false);
                        }}
                        className="p-4 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                            alt={f.username}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{f.username}</p>
                            <p className="text-xs text-slate-500">@{f.username}</p>
                          </div>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="text-blue-600 text-sm font-medium"
                        >
                          →
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Following Modal */}
      <AnimatePresence>
        {showFollowing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFollowing(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-slate-900">Following</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFollowing(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition"
                >
                  <FaXmark className="text-slate-600" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {following.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <FaUsers className="text-4xl text-slate-300 mb-3" />
                    <p className="text-slate-600 font-medium">Not following anyone</p>
                    <p className="text-slate-500 text-sm mt-1">Follow writers to see their posts</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {following.map((f) => (
                      <motion.div
                        key={f._id}
                        whileHover={{ backgroundColor: '#f8fafc' }}
                        onClick={() => {
                          navigate(`/users/${f._id}`);
                          setShowFollowing(false);
                        }}
                        className="p-4 cursor-pointer transition flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}
                            alt={f.username}
                            className="w-12 h-12 rounded-full object-cover border border-slate-200"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{f.username}</p>
                            <p className="text-xs text-slate-500">@{f.username}</p>
                          </div>
                        </div>
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="text-blue-600 text-sm font-medium"
                        >
                          →
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


      {/* All Stories Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-bold text-slate-900">Your Stories</h2>
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaPen className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">No stories yet</p>
            <p className="text-slate-500 text-sm mb-6">Start writing to share your thoughts</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/create-post')}
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition inline-flex items-center gap-2"
            >
              <FaPlus /> Create Story
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 cursor-pointer" onClick={() => navigate(`/posts/${post._id}`)}>
                    <div className="flex items-start justify-between mb-1.5">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition flex-1 line-clamp-1">{post.title}</h3>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {post.status === 'published' ? 'Live' : 'Draft'}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <p className="text-slate-600 text-xs line-clamp-2 mb-2">{post.excerpt || (post.content && post.content.replace(/<[^>]+>/g, '').slice(0, 220))}</p>
                    
                    {/* Post Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <span className="text-red-500">♥</span>
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500">💬</span>
                        <span>{post.commentsCount || 0}</span>
                      </div>
                      <span className="text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/edit/${post._id}`)}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="Edit Post"
                    >
                      <FaPen className="text-xs" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(post._id)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                      title="Delete Post"
                    >
                      <FaTrash className="text-xs" />
                    </motion.button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {deleteConfirm === post._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 pt-3 border-t border-slate-200 bg-red-50 p-2 rounded-lg"
                    >
                      <p className="text-xs text-red-900 mb-2">Delete this story?</p>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeletePost(post._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-1 bg-slate-200 text-slate-900 rounded text-xs font-medium hover:bg-slate-300 transition"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
