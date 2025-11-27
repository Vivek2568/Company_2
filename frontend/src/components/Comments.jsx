import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaReply, FaTrash, FaSpinner, FaComment, FaXmark } from 'react-icons/fa6';

const CommentItem = ({ comment, onDelete, onLike, onReply, currentUser }) => {
  const isAuthor = currentUser && comment.userId?._id === currentUser._id;
  const isLiked = currentUser && comment.likes?.includes(currentUser._id);

  return (
    <div className="py-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white uppercase">
            {comment.userId?.username?.[0] || 'U'}
          </span>
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">
              {comment.userId?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Content */}
          <div 
            className="text-slate-700 dark:text-slate-300 leading-relaxed mb-2 prose prose-sm dark:prose-invert max-w-none
              prose-p:my-1 prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />

          {/* Actions */}
          <div className="flex items-center gap-3 text-sm">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLike(comment._id)}
              className={`flex items-center gap-1 text-sm transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' 
                  : 'text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400'
              }`}
            >
              {isLiked ? <FaHeart className="text-base" /> : <FaRegHeart className="text-base" />}
              <span>{comment.likes?.length || 0}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onReply(comment._id)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <FaReply className="text-base" />
              <span>Reply</span>
            </motion.button>

            {isAuthor && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(comment._id)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors ml-auto"
              >
                <FaTrash className="text-base" />
                <span>Delete</span>
              </motion.button>
            )}
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply._id} className="flex gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white uppercase">
                      {reply.userId?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {reply.userId?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(reply.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-300">{reply.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Comments = ({ postId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const fetchComments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await axios.get(`/api/comments/${postId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(true);
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) {
      toast.info('Please login or signup to post comments');
      return navigate('/login');
    }
    try {
      await axios.post('/api/comments', { postId, content, replyTo });
      setContent('');
      setReplyTo(null);
      toast.success('Comment posted');
      fetchComments(false);
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error(err.response?.data?.message || 'Error posting comment');
    }
  };

  const handleDelete = async (id) => {
    if (!user) {
      toast.info('Please login to delete comments');
      return navigate('/login');
    }
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${id}`);
      toast.success('Comment deleted');
      fetchComments(false);
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error(err.response?.data?.message || 'Error deleting comment');
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      toast.info('Login to like comments');
      return navigate('/login');
    }
    try {
      await axios.post(`/api/comments/${id}/like`);
      fetchComments(false); // Refresh without showing loading
    } catch (err) {
      console.error('Error liking comment:', err);
      toast.error(err.response?.data?.message || 'Error liking comment');
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mb-4"
      >
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Comments ({comments.length})
        </h2>
        <div className="h-1 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
      </motion.div>

      {/* Comment Form */}
      {user ? (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-slate-50 card-bg rounded-lg border border-slate-200 dark:border-slate-700"
        >
          {replyTo && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <FaReply className="text-base" />
              <span>Replying to comment</span>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setContent('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-auto"
              >
                <FaXmark className="text-base" />
              </button>
            </div>
          )}
          
            <div className="flex gap-2">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-white uppercase">
                {user.username?.[0]}
              </span>
            </div>

            {/* Input and Button */}
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white card-bg rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                rows="3"
              />
              <div className="flex justify-end gap-2 mt-2">
                {replyTo && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setReplyTo(null);
                      setContent('');
                    }}
                    className="px-3 py-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!content.trim()}
                  className="px-4 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {replyTo ? 'Reply' : 'Comment'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10 p-6 bg-slate-50 card-bg rounded-xl border border-slate-200 dark:border-slate-700 text-center"
        >
          <p className="text-slate-600 dark:text-slate-300 mb-4 font-medium">Join the conversation</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
          >
            Sign in to comment
          </motion.button>
        </motion.div>
      )}

      {/* Comments List */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center py-12"
        >
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span className="text-lg animate-spin"><FaSpinner className="inline" /></span>
            <span>Loading comments...</span>
          </div>
        </motion.div>
      ) : (
        <div>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <span className="text-5xl text-slate-300 dark:text-slate-600 mb-3 block"><FaComment className="text-5xl mx-auto" /></span>
              <p className="text-slate-500 dark:text-slate-400">No comments yet. Be the first to comment!</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-0"
            >
              {comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onDelete={handleDelete}
                  onLike={handleLike}
                  onReply={setReplyTo}
                  currentUser={user}
                />
              ))}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comments;