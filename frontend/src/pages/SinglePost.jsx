import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import Loader from '../components/Loader';
import Comments from '../components/Comments';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [recommendedPosts, setRecommendedPosts] = useState({ sameAuthor: [], sameCategory: [] });
  const [recommendedLoading, setRecommendedLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data);
        setLikes(res.data.likes?.length || 0);
        
        // Fetch comments count
        const commentsRes = await axios.get(`/api/comments/${id}`);
        setCommentsCount(Array.isArray(commentsRes.data) ? commentsRes.data.length : 0);
        
        // Fetch recommended posts
        setRecommendedLoading(true);
        const recommendedRes = await axios.get(`/api/posts/recommendations?postId=${res.data._id}&limit=3`);
        setRecommendedPosts(recommendedRes.data);
        setRecommendedLoading(false);
      } catch (err) {
        console.error('Error loading post:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    try {
      if (!user) return navigate('/login');
      const res = await axios.post(`/api/posts/${post._id}/like`);
      if (res && res.data) {
        setLikes(res.data.likes);
      }
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  if (loading) return <Loader />;

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-md mx-4"
      >
        <motion.span
          className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600 mb-4 inline-block"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          error_outline
        </motion.span>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Post not found</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Sorry, the post you are looking for does not exist.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-full font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );

  const imageUrl = post.images?.[0]
    ? `http://localhost:5000/uploads/${post.images[0]}`
    : post.thumbnail;

  return (
    <div className="min-h-screen bg-[#FFFBEB] page-bg">
      {/* Sticky Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-slate-200 dark:border-slate-700 bg-[#FFFBEB] page-bg sticky top-0 z-40 shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            <span>Back</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Title Section - Full Width */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-4">
            {post.title}
          </h1>

          {/* Author Info & Meta */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <Link to={`/users/${post.author._id}`}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0"
                >
                  <span className="text-sm font-bold text-white uppercase">
                    {post.author.username[0]}
                  </span>
                </motion.div>
              </Link>
              <div>
                <Link
                  to={`/users/${post.author._id}`}
                  className="text-slate-900 dark:text-white font-semibold text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                >
                  {post.author.username}
                </Link>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                  <span>•</span>
                  <span>{Math.ceil(post.content.replace(/<[^>]+>/g, "").length / 1000)} min read</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLike}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
                title="Like"
              >
                <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                  favorite
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCount(likes)}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors group"
                title="Comments"
              >
                <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  chat_bubble
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{formatCount(commentsCount)}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Featured image will render inside the article content so it flows with the post body */}

        {/* Main Content Grid - Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Article - 2 columns */}
          <article className="lg:col-span-2">
            {/* Content Section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white card-bg rounded-2xl p-8 sm:p-10 lg:p-12 mb-8 shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div
                className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-100
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white
                  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-12
                  prose-h2:text-3xl prose-h2:mb-5 prose-h2:mt-10
                  prose-h3:text-2xl prose-h3:mb-4 prose-h3:mt-8
                  prose-p:text-slate-700 dark:prose-p:text-white prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
                  prose-ul:my-6 prose-ol:my-6
                  prose-li:text-slate-700 dark:prose-li:text-white prose-li:my-2 prose-li:text-base
                  prose-img:rounded-xl prose-img:my-8 prose-img:shadow-lg
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
                  prose-blockquote:text-slate-700 dark:prose-blockquote:text-slate-400 prose-blockquote:my-8 prose-blockquote:bg-slate-100 dark:prose-blockquote:bg-slate-800 prose-blockquote:py-4 prose-blockquote:px-4 prose-blockquote:rounded-lg
                  prose-code:bg-slate-900 dark:prose-code:bg-slate-800 prose-code:text-blue-300 prose-code:px-3 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
                  prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:overflow-x-auto prose-pre:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              {/* If post has images, insert a small carousel at the top of content */}
              {post.images && post.images.length > 0 && (
                <div className="mt-6 mb-6">
                  <div className="relative max-w-full mx-auto rounded-lg overflow-hidden shadow-lg">
                    <img src={`http://localhost:5000/uploads/${post.images[0]}`} alt={post.title} className="w-full h-48 object-cover rounded-md" />
                    {post.images.length > 1 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                        <button onClick={() => { /* client-side carousel could be added later */ }} className="bg-white/90 p-2 rounded-full shadow">
                          <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        <button onClick={() => {}} className="bg-white/90 p-2 rounded-full shadow">
                          <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
              {post.tags && post.tags.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700"
              >
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">Tags</h3>
                <div className="flex flex-wrap gap-3">
                  {post.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold hover:shadow-md transition-all cursor-pointer border border-blue-200 dark:border-blue-800"
                    >
                      #{tag.name || tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
              )}

            {/* Author Bio */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-700"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Link to={`/users/${post.author._id}`}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0"
                    >
                      <span className="text-xl font-bold text-white uppercase">
                        {post.author.username[0]}
                      </span>
                    </motion.div>
                  </Link>
                  <div className="flex-1">
                    <div className="mb-1">
                      <Link
                        to={`/users/${post.author._id}`}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
                      >
                        {post.author.username}
                      </Link>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
                      {post.author.bio || "Writer and creator sharing thoughts and stories with the community."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </article>

          {/* Sidebar - 1 column */}
          <aside className="lg:col-span-1 space-y-12">
            {!recommendedLoading && (recommendedPosts.sameAuthor.length > 0 || recommendedPosts.sameCategory.length > 0) && (
              <>
                {/* Same Author Section */}
                {recommendedPosts.sameAuthor.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                      More from {post.author.username}
                    </h3>
                    <div className="space-y-6">
                      {recommendedPosts.sameAuthor.slice(0, 3).map((recPost) => {
                        const recImageUrl = recPost.images?.[0]
                          ? `http://localhost:5000/uploads/${recPost.images[0]}`
                          : (recPost.thumbnail || "https://via.placeholder.com/400");
                        return (
                          <motion.div
                            key={recPost._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                            whileHover={{ x: 4 }}
                            className="py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                {/* Author & Date */}
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-white uppercase">
                                      {recPost.author?.username?.[0]}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {recPost.author?.username}
                                  </p>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(recPost.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                                  {recPost.title}
                                </h4>

                                {/* Excerpt */}
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                  {recPost.excerpt || (recPost.content && recPost.content.replace(/<[^>]+>/g, '').slice(0, 120))}
                                </p>
                              </div>

                              {/* Thumbnail on right */}
                              <div className="w-20 h-14 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {recPost.images?.[0] ? (
                                  <img
                                    src={recImageUrl}
                                    alt={recPost.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : recPost.thumbnail ? (
                                  <img src={recPost.thumbnail} alt={recPost.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400"></div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <motion.button
                                whileHover={{ x: 2 }}
                                onClick={() => navigate(`/posts/${recPost._id}`)}
                                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                Read more →
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Same Category Section */}
                {recommendedPosts.sameCategory.length > 0 && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                      {post.categories?.[0]?.name || 'Similar'} Category
                    </h3>
                    <div className="space-y-6">
                      {recommendedPosts.sameCategory.slice(0, 3).map((recPost) => {
                        const recImageUrl = recPost.images?.[0]
                          ? `http://localhost:5000/uploads/${recPost.images[0]}`
                          : (recPost.thumbnail || "https://via.placeholder.com/400");
                        return (
                          <motion.div
                            key={recPost._id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            viewport={{ once: true }}
                            whileHover={{ x: 4 }}
                            className="py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0 transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                {/* Author & Date */}
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-bold text-white uppercase">
                                      {recPost.author?.username?.[0]}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                                    {recPost.author?.username}
                                  </p>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {new Date(recPost.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>

                                {/* Title */}
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors line-clamp-2 mb-1">
                                  {recPost.title}
                                </h4>

                                {/* Excerpt */}
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                                  {recPost.excerpt || (recPost.content && recPost.content.replace(/<[^>]+>/g, '').slice(0, 120))}
                                </p>
                              </div>

                              {/* Thumbnail on right */}
                              <div className="w-20 h-14 flex-shrink-0 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800">
                                {recPost.images?.[0] ? (
                                  <img
                                    src={recImageUrl}
                                    alt={recPost.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : recPost.thumbnail ? (
                                  <img src={recPost.thumbnail} alt={recPost.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400"></div>
                                )}
                              </div>
                            </div>
                            <div className="mt-2">
                              <motion.button
                                whileHover={{ x: 2 }}
                                onClick={() => navigate(`/posts/${recPost._id}`)}
                                className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                              >
                                Read more →
                              </motion.button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>

      {/* Comments Section */}
      <div className="py-8 border-t border-slate-200 dark:border-slate-700">
        <div id="comments" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white card-bg rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <Comments postId={post._id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SinglePost;