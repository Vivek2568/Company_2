import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import axios from '../api/axios';
import { FiEdit2, FiThumbsUp, FiThumbsDown, FiMessageCircle, FiPlusCircle, FiLogOut } from 'react-icons/fi';
import { motion } from 'framer-motion';


const Profile = () => {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchFollowers();
      fetchFollowing();
    }
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
      setPosts(postsWithComments);
    } catch (error) {
      setPosts([]);
    } finally {
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

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto px-2 py-8">
      {/* Profile Hero Card */}
      <div className="relative bg-gradient-to-r from-slate-200 to-emerald-100 rounded-3xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in mb-10">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full bg-slate-100 shadow-lg flex items-center justify-center overflow-hidden border-4 border-slate-200">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-slate-800 mb-2 drop-shadow-lg">{user.username}</h1>
          <p className="text-lg text-slate-600 mb-2">{user.email}</p>
          <div className="flex flex-col md:flex-row gap-4 mt-4 items-center md:items-start justify-center md:justify-start">
            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-200 text-slate-700 font-semibold shadow hover:bg-slate-300 transition-all duration-200 hover:scale-105"
            >
              <FiLogOut /> Logout
            </button>
            <button
              onClick={() => navigate('/create-post')}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-400 text-white font-semibold shadow hover:bg-emerald-500 transition-all duration-200 hover:scale-105 animate-bounce-slow"
            >
              <FiPlusCircle /> Create Post
            </button>
          </div>
          {/* Followers/Following Section */}
          <div className="flex gap-6 mt-6 justify-center md:justify-start">
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Followers</span>
              <div className="flex flex-wrap gap-2">
                {followers.length === 0 ? (
                  <span className="text-slate-400 text-xs">No followers yet</span>
                ) : (
                  followers.map(f => (
                    <motion.div key={f._id} whileHover={{ y: -3 }} className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold" onClick={() => navigate(`/users/${f._id}`)}>
                      <img src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${f.username}`} alt="avatar" className="w-5 h-5 rounded-full" />
                      <span>{f.username}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Following</span>
              <div className="flex flex-wrap gap-2">
                {following.length === 0 ? (
                  <span className="text-slate-400 text-xs">Not following anyone</span>
                ) : (
                  following.map(f => (
                    <motion.div key={f._id} whileHover={{ y: -3 }} className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold" onClick={() => navigate(`/users/${f._id}`)}>
                      <img src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${f.username}`} alt="avatar" className="w-5 h-5 rounded-full" />
                      <span>{f.username}</span>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-slate-50 rounded-2xl shadow-lg p-6 animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-6 text-slate-700 flex items-center gap-2">
          <span>Your Posts</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">{posts.length}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-base rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gradient-to-r from-slate-100 to-emerald-50 text-slate-700">
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-center">Likes</th>
                <th className="py-3 px-4 text-center">Dislikes</th>
                <th className="py-3 px-4 text-center">Comments</th>
                <th className="py-3 px-4 text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr
                  key={post._id}
                  className="border-b last:border-b-0 hover:bg-blue-50/60 transition group"
                >
                  <td className="py-3 px-4 font-semibold">
                    <span
                      className="text-emerald-700 hover:underline cursor-pointer transition group-hover:text-emerald-500"
                      onClick={() => navigate(`/posts/${post._id}`)}
                    >
                      {post.title}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                      {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">
                    <span className="inline-flex items-center gap-1"><FiThumbsUp />{post.likes ? post.likes.length : 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">
                    <span className="inline-flex items-center gap-1"><FiThumbsDown />{post.dislikes ? post.dislikes.length : 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">
                    <span className="inline-flex items-center gap-1"><FiMessageCircle />{post.commentsCount || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 shadow transition-all duration-150 hover:scale-110"
                      title="Edit Post"
                      onClick={() => navigate(`/edit/${post._id}`)}
                    >
                      <FiEdit2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (
          <div className="text-center text-slate-400 py-8 text-lg">No posts yet. Start by creating your first post!</div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        .animate-fade-in { animation: fadeIn 1s ease; }
        .animate-fade-in-up { animation: fadeInUp 1s ease; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px);} to { opacity: 1; transform: none; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>
    </div>
  );
};

export default Profile;
