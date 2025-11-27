import React from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaComment } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const HomePostCard = ({ post, onLike, onComment, formatCount, imageUrl, user }) => {
  const navigate = useNavigate();
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col pb-6 border-b border-slate-200 dark:border-slate-700"
    >
      {/* Image */}
      <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Author & Date */}
        <div className="flex items-center gap-2 text-xs text-[#4d7399] dark:text-slate-400">
          <span className="font-medium">{post.author.username}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Title */}
        <h3 
          className="line-clamp-2 text-xl font-bold leading-tight text-[#0e141b] transition-colors group-hover:text-blue-600 dark:text-slate-50 dark:group-hover:text-blue-400" 
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {post.title}
        </h3>

        {/* Excerpt */}
        <p 
          className="line-clamp-3 flex-1 text-base leading-relaxed text-slate-600 dark:text-slate-300" 
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {post.excerpt || post.content.replace(/<[^>]+>/g, "").slice(0, 150) + "..."}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => onLike(e, post)}
              className="flex items-center gap-1 text-xs transition-colors hover:text-red-500"
            >
              <FaHeart className="text-base" />
              <span>{formatCount(post.likes ? post.likes.length : 0)}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => onComment(e, post)}
              className="flex items-center gap-1 text-xs transition-colors hover:text-blue-500"
            >
              <FaComment className="text-base" />
              <span>{formatCount(post.commentsCount || 0)}</span>
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.stopPropagation();
              if (!user) return navigate('/signup');
              navigate(`/posts/${post._id}`);
            }}
            className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Read More →
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

export default HomePostCard;
