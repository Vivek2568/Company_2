import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { motion } from 'framer-motion';

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
      setPosts(postsWithComments);
    } catch (err) {
      setPosts([]);
    }
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="relative bg-gradient-to-r from-slate-200 to-emerald-100 rounded-3xl shadow-xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden border-4 border-slate-200 shadow-md">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">{profile.username}</h1>
              <div className="text-xs text-slate-500">@{profile.username}</div>
            </div>
            <p className="text-sm text-slate-500 mt-1">{profile.bio || profile.email}</p>
            <div className="flex items-center gap-3 mt-3">
              {user && user.id !== profile._id && (
                isFollowing ? (
                  <button onClick={handleUnfollow} className="px-4 py-1 bg-rose-400 text-white rounded-md font-semibold hover:bg-rose-500 transition">Unfollow</button>
                ) : (
                  <button onClick={handleFollow} className="px-4 py-1 bg-emerald-400 text-white rounded-md font-semibold hover:bg-emerald-500 transition">Follow</button>
                )
              )}
              <button onClick={() => navigate(`/users/${profile._id}`)} className="px-3 py-1 border rounded-md text-sm">View posts</button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 mt-6">
          <div>
            <button onClick={() => { setShowFollowers(!showFollowers); setShowFollowing(false); }} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Followers</span>
              <span className="text-sm font-semibold text-slate-700">{followers.length}</span>
            </button>
            {showFollowers && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-h-40 overflow-y-auto bg-slate-50 card-bg p-3 rounded-md border border-slate-100 dark:border-slate-700">
                {followers.length === 0 ? (
                  <div className="text-xs text-slate-400">No followers yet</div>
                ) : (
                  followers.map(f => (
                    <motion.div whileHover={{ x: 4 }} key={f._id} className="flex items-center justify-between py-2 cursor-pointer" onClick={() => navigate(`/users/${f._id}`)}>
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${f.username}`} alt="avatar" className="w-8 h-8 rounded-full" />
                        <div className="text-sm text-slate-700">{f.username}</div>
                      </div>
                      <div className="text-xs text-slate-500">{f.email}</div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </div>

          <div>
            <button onClick={() => { setShowFollowing(!showFollowing); setShowFollowers(false); }} className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Following</span>
              <span className="text-sm font-semibold text-slate-700">{following.length}</span>
            </button>
            {showFollowing && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 max-h-40 overflow-y-auto bg-slate-50 card-bg p-3 rounded-md border border-slate-100 dark:border-slate-700">
                {following.length === 0 ? (
                  <div className="text-xs text-slate-400">Not following anyone</div>
                ) : (
                  following.map(f => (
                    <motion.div whileHover={{ x: 4 }} key={f._id} className="flex items-center justify-between py-2 cursor-pointer" onClick={() => navigate(`/users/${f._id}`)}>
                      <div className="flex items-center gap-3">
                        <img src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${f.username}`} alt="avatar" className="w-8 h-8 rounded-full" />
                        <div className="text-sm text-slate-700">{f.username}</div>
                      </div>
                      <div className="text-xs text-slate-500">{f.email}</div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
      
      {/* User's Posts - same layout as Profile page */}
      <div className="bg-slate-50 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-700 flex items-center gap-2">
          <span>{user && user.id === profile._id ? 'Your Posts' : `Posts by ${profile.username}`}</span>
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
                {user && user.id === profile._id && <th className="py-3 px-4 text-center">Edit</th>}
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post._id} className="border-b last:border-b-0 hover:bg-blue-50/60 transition group">
                  <td className="py-3 px-4 font-semibold">
                    <span className="text-emerald-700 hover:underline cursor-pointer transition group-hover:text-emerald-500" onClick={() => navigate(`/posts/${post._id}`)}>{post.title}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>{post.status.charAt(0).toUpperCase() + post.status.slice(1)}</span>
                  </td>
                  <td className="py-3 px-4">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">{post.likes ? post.likes.length : 0}</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">{post.dislikes ? post.dislikes.length : 0}</td>
                  <td className="py-3 px-4 text-center text-slate-500 font-bold">{post.commentsCount || 0}</td>
                  {user && user.id === profile._id && (
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => navigate(`/edit/${post._id}`)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 shadow transition-all duration-150 hover:scale-110">Edit</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {posts.length === 0 && (<div className="text-center text-slate-400 py-8 text-lg">No posts yet.</div>)}
      </div>
    </div>
  );
};

export default UserProfile;
