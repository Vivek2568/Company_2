import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaComment, FaEye, FaUser, FaUsers, FaFire, FaPen, FaXmark } from 'react-icons/fa6';

const UserProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchFollowers();
    fetchFollowing();
    fetchUserPosts();
  }, [id, user]);

  const fetchUserPosts = async () => {
    try {
      const res = await axios.get('/api/posts', { params: { author: id, limit: 100 } });
      const posts = res.data.posts || [];
      const commentCounts = {};
      await Promise.all(posts.map(async (p) => {
        try {
          const r = await axios.get(`/api/comments/${p._id}`);
          commentCounts[p._id] = Array.isArray(r.data) ? r.data.length : 0;
        } catch (e) {
          commentCounts[p._id] = 0;
        }
      }));
      const postsWithComments = posts.map(p => ({ ...p, commentsCount: commentCounts[p._id] || 0 }));
      setPosts(postsWithComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setPosts([]);
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

  const fetchProfile = async () => {
    try {
      const url = `/api/users/${id}`;
      const res = await axios.get(url);
      setProfile(res.data);
      if (user && res.data.followers.includes(user.id)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (err) {
      console.error('UserProfile fetch error:', err);
      console.error('Request URL:', `/api/users/${id}`);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowers = async () => {
    try {
      const res = await axios.get(`/api/users/${id}/followers`);
      setFollowers(res.data);
    } catch {
      setFollowers([]);
    }
  };

  const fetchFollowing = async () => {
    try {
      const res = await axios.get(`/api/users/${id}/following`);
      setFollowing(res.data);
    } catch {
      setFollowing([]);
    }
  };

  const handleFollow = async () => {
    try {
      // optimistic UI
      setIsFollowing(true);
      await axios.post(`/api/users/${id}/follow`);
      fetchFollowers();
    } catch {}
  };

  const handleUnfollow = async () => {
    try {
      // optimistic UI
      setIsFollowing(false);
      await axios.post(`/api/users/${id}/unfollow`);
      fetchFollowers();
    } catch {}
  };

  if (loading) return <Loader />;
  if (!profile) return <div className="text-center py-10">User not found.</div>;

  const analytics = calculateAnalytics();

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Hero Section - Medium.com style */}
      <div className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left: Avatar & Basic Info */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="sticky top-8"
              >
                <div className="w-full rounded-full bg-gradient-to-br from-blue-400 to-purple-600 aspect-square flex items-center justify-center mb-4 overflow-hidden">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-1">{profile.username}</h1>
                <p className="text-slate-600 text-sm mb-4">@{profile.username}</p>
                <p className="text-slate-700 text-base leading-relaxed mb-6">{profile.bio || profile.email}</p>
                
                {user && user.id !== profile._id && (
                  <div className="flex gap-3">
                    {isFollowing ? (
                      <button onClick={handleUnfollow} className="flex-1 px-4 py-2 bg-slate-100 text-slate-900 rounded-full font-semibold hover:bg-slate-200 transition border border-slate-200">
                        Following
                      </button>
                    ) : (
                      <button onClick={handleFollow} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-full font-semibold hover:bg-slate-800 transition">
                        Follow
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right: Stats */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {/* Total Posts */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                >
                  <div className="text-3xl font-bold text-slate-900">{posts.length}</div>
                  <div className="text-sm text-slate-600 mt-1">Posts</div>
                </motion.div>

                {/* Followers */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
                  onClick={() => { setShowFollowers(true); setShowFollowing(false); }}
                >
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition">{followers.length}</div>
                  <div className="text-sm text-slate-600 mt-1 group-hover:text-slate-900 transition">Followers</div>
                </motion.div>

                {/* Following */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-md transition cursor-pointer group"
                  onClick={() => { setShowFollowing(true); setShowFollowers(false); }}
                >
                  <div className="text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition">{following.length}</div>
                  <div className="text-sm text-slate-600 mt-1 group-hover:text-slate-900 transition">Following</div>
                </motion.div>

                {/* Claps */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                >
                  <div className="text-3xl font-bold text-red-500">{analytics.totalLikes}</div>
                  <div className="text-sm text-slate-600 mt-1">Claps</div>
                </motion.div>

                {/* Comments */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                >
                  <div className="text-3xl font-bold text-blue-500">{analytics.totalComments}</div>
                  <div className="text-sm text-slate-600 mt-1">Comments</div>
                </motion.div>

                {/* Views */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition"
                >
                  <div className="text-3xl font-bold text-green-600">{analytics.totalViews}</div>
                  <div className="text-sm text-slate-600 mt-1">Views</div>
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
              {/* Header */}
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

              {/* Content */}
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
              {/* Header */}
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

              {/* Content */}
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


      {/* Top Post Highlight */}
      {analytics.topPost && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-slate-200">
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-6">Top Post</h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition cursor-pointer"
            onClick={() => navigate(`/posts/${analytics.topPost._id}`)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition mb-2">{analytics.topPost.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{analytics.topPost.excerpt || 'No excerpt'}</p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <FaHeart className="text-red-500" />
                    <span className="text-slate-700">{analytics.topPost.likes?.length || 0} claps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaComment className="text-blue-500" />
                    <span className="text-slate-700">{analytics.topPost.commentsCount || 0} comments</span>
                  </div>
                  <div className="text-slate-500">{new Date(analytics.topPost.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-500">⭐</div>
                <div className="text-xs text-slate-500 mt-1">Most clapped</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* All Posts Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-slate-900">{user && user.id === profile._id ? 'Your Stories' : `${profile.username}'s Stories`}</h2>
          <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{posts.length} total</span>
        </div>

        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FaPen className="text-5xl text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium">No stories yet</p>
            <p className="text-slate-500 text-sm">Start writing to share your thoughts</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border border-slate-200 rounded-lg p-6 hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
                onClick={() => navigate(`/posts/${post._id}`)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition mb-2">{post.title}</h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">{post.excerpt || (post.content && post.content.replace(/<[^>]+>/g, '').slice(0, 220))}</p>
                    
                    {/* Post Stats */}
                    <div className="flex items-center gap-6 text-xs text-slate-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-500">♥</span>
                        <span>{post.likes?.length || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-500">💬</span>
                        <span>{post.commentsCount || 0}</span>
                      </div>
                      <span className="text-slate-400">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button (for own posts) */}
                  {user && user.id === profile._id && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit/${post._id}`);
                      }}
                      className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                    >
                      ✏️
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
