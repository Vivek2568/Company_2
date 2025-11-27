import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPen, FaTrash } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const StoryCard = ({ 
  post, 
  idx, 
  onEditClick, 
  onDeleteClick, 
  deleteConfirm, 
  onDeleteConfirm, 
  onDeleteCancel, 
  onDeletePost,
  showEditDelete = false 
}) => {
  const navigate = useNavigate();

  return (
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
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600 transition flex-1 line-clamp-1">
              {post.title}
            </h3>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2 ${
              post.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {post.status === 'published' ? 'Live' : 'Draft'}
            </span>
          </div>
          
          {/* Content */}
          <p className="text-slate-600 text-xs line-clamp-2 mb-2">
            {post.excerpt || (post.content && post.content.replace(/<[^>]+>/g, '').slice(0, 220))}
          </p>
          
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
            <span className="text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Edit & Delete Buttons */}
        {showEditDelete && (
          <div className="flex gap-1 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEditClick(post._id)}
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
        )}
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
                onClick={() => onDeletePost(post._id)}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition"
              >
                Delete
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDeleteCancel()}
                className="px-3 py-1 bg-slate-200 text-slate-900 rounded text-xs font-medium hover:bg-slate-300 transition"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StoryCard;
