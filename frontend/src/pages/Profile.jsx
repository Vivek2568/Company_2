import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import axios from '../api/axios';
import { motion } from 'framer-motion';
import { FaUser, FaUsers, FaPen, FaTrash, FaPlus } from 'react-icons/fa6';
import { toast } from 'react-toastify';
import UserListModal from '../components/UserListModal';
import StatsCard from '../components/StatsCard';
import ProfileHeader from '../components/ProfileHeader';

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

  const calculateAnalytics = () => {
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
    const totalComments = posts.reduce((sum, p) => sum + (p.commentsCount || 0), 0);
    return { totalViews, totalLikes, totalComments };
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
      {/* Header/Hero Section */}
      <div className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
            <ProfileHeader user={user} onLogout={handleLogout} isOwnProfile={true} showLogout={true} />

            <div className="md:col-span-3">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                <StatsCard value={posts.length} label="Posts" delay={0.1} />
                <StatsCard 
                  value={followers.length} 
                  label="Followers" 
                  delay={0.2} 
                  isClickable={true}
                  onClick={() => { setShowFollowers(true); setShowFollowing(false); }}
                />
                <StatsCard 
                  value={following.length} 
                  label="Following" 
                  delay={0.3} 
                  isClickable={true}
                  onClick={() => { setShowFollowing(true); setShowFollowers(false); }}
                />
                <StatsCard value={analytics.totalLikes} label="Claps" delay={0.4} textColor="text-red-500" />
                <StatsCard value={analytics.totalComments} label="Comments" delay={0.5} textColor="text-blue-500" />
                <StatsCard value={analytics.totalViews} label="Views" delay={0.6} textColor="text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserListModal 
        isOpen={showFollowers} 
        onClose={() => setShowFollowers(false)}
        title="Followers"
        users={followers}
        emptyIcon={FaUser}
        emptyTitle="No followers yet"
        emptyMessage="Share great content to gain followers"
      />

      <UserListModal 
        isOpen={showFollowing} 
        onClose={() => setShowFollowing(false)}
        title="Following"
        users={following}
        emptyIcon={FaUsers}
        emptyTitle="Not following anyone"
        emptyMessage="Follow writers to see their posts"
      />

      {/* Stories Section */}
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
              <StoryCardItem
                key={post._id}
                post={post}
                idx={idx}
                deleteConfirm={deleteConfirm}
                onDeleteClick={setDeleteConfirm}
                onDeleteCancel={() => setDeleteConfirm(null)}
                onDeletePost={handleDeletePost}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Story Card Item Component (extracted for reusability)
const StoryCardItem = ({ post, idx, deleteConfirm, onDeleteClick, onDeleteCancel, onDeletePost, navigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 transition group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 cursor-pointer" onClick={() => navigate(`/posts/${post._id}`)}>
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition flex-1 line-clamp-1">
              {post.title}
            </h3>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 ${
              post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {post.status === 'published' ? 'Live' : 'Draft'}
            </span>
          </div>
          
          <p className="text-slate-600 text-xs line-clamp-2 mb-2">
            {post.excerpt || (post.content && post.content.replace(/<[^>]+>/g, '').slice(0, 220))}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <span className="text-red-500">♥</span>
              <span>{post.likes?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">💬</span>
              <span>{post.commentsCount || 0}</span>
            </div>
            <span className="text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

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
            onClick={() => onDeleteClick(post._id)}
            className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
            title="Delete Post"
          >
            <FaTrash className="text-xs" />
          </motion.button>
        </div>
      </div>

      {/* Delete Confirmation */}
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
              onClick={() => onDeletePost(post._id)}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
            >
              Delete
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDeleteCancel}
              className="px-3 py-1 bg-slate-200 text-slate-900 rounded text-xs font-medium hover:bg-slate-300 transition"
            >
              Cancel
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
