import React, { useState, useEffect, useContext } from 'react';
import { DashboardRefreshContext } from './Dashboard';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import EditorToolbar from '../components/EditorToolbar';
import PreviewModal from '../components/PreviewModal';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FaArrowLeft, FaEye, FaCheck, FaChevronLeft, FaChevronRight, FaXmark, FaSpinner, FaImage } from 'react-icons/fa6';


const CreateEditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { trigger: triggerDashboardRefresh } = useContext(DashboardRefreshContext) || {};

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [status, setStatus] = useState('draft');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSearch, setTagSearch] = useState('');
  const [tags, setTags] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
    setCurrentPreviewIndex(0);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    // adjust preview index if needed
    setCurrentPreviewIndex(prev => {
      if (newPreviews.length === 0) return 0;
      if (prev >= newPreviews.length) return newPreviews.length - 1;
      return prev;
    });
  };

  useEffect(() => {
    fetchCategories();
    if (id) {
      setFetchLoading(true);
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`/api/posts/${id}`);
      const post = response.data;
      setTitle(post.title);
      setContent(post.content);
      setCategories(post.categories.map(c => c._id));
      // Tags are stored as array, join them with comma
      setTagInput(Array.isArray(post.tags) ? post.tags.join(', ') : '');
      setStatus(post.status);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setAvailableCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      toast.error('Please write some content');
      return;
    }

    if (images.length === 0) {
      toast.warn('No images selected!');
      return;
    }

    if (!categories[0]) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('status', status);
      formData.append('categories', categories[0]);
      // Parse comma-separated tags and trim whitespace
      if (tagInput.trim()) {
        const tagsArray = tagInput.split(',').map(tag => tag.trim()).filter(Boolean);
        formData.append('tags', tagsArray.join(','));
      }
      images.forEach(img => formData.append('images', img));

      if (id) {
        await axios.put(`/api/posts/${id}`, formData);
        toast.success('Post updated successfully');
        if (triggerDashboardRefresh) triggerDashboardRefresh();
        navigate('/dashboard');
      } else {
        await axios.post('/api/posts', formData);
        toast.success('Post created successfully');
        if (triggerDashboardRefresh) triggerDashboardRefresh();
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      const resp = error.response?.data;
      if (resp?.errors && Array.isArray(resp.errors)) {
        resp.errors.forEach((e) => toast.error(e));
      } else if (resp?.message) {
        toast.error(resp.message);
      } else {
        toast.error(error.message || 'Error saving post');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <Loader />;

  const filteredTags = availableTags.filter(tag =>
    tag.name.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(tag.name)
  );

  return (
    <div className="min-h-screen bg-white card-bg">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white card-bg border-b border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <motion.button
              whileHover={{ x: -4 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              <span className="font-medium text-sm">Back</span>
            </motion.button>

            <div className="flex items-center gap-3">
              {/* Preview Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 card-bg text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <FaEye className="text-lg" />
                <span className="text-sm font-medium hidden sm:inline">Preview</span>
              </motion.button>

              {/* Status Badge */}
              <motion.span
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  status === 'published'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                )}
              >
                {status === 'published' ? 'Published' : 'Draft'}
              </motion.span>

              {/* Publish Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span className="text-sm">Saving...</span>
                  </>
                ) : (
                  <>
                    <FaCheck className="text-lg" />
                    <span className="text-sm">{id ? 'Update' : 'Publish'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 shadow-md border border-slate-200 dark:border-slate-700"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter your blog title..."
              className="w-full text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border-0 focus:ring-0 outline-none bg-transparent"
            />
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Make it catchy and engaging</p>
          </motion.div>

          {/* Image Upload Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {imagePreviews.length === 0 ? (
              <div className="relative group">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/20 group-hover:shadow-lg cursor-pointer">
                  <motion.span
                    className="text-6xl text-slate-400 dark:text-slate-500 mb-4 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaImage className="text-6xl" />
                  </motion.span>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-200">Add your cover image</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Click to browse or drag and drop</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-3">Support: JPG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">Cover Images</p>
                <div className="relative max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700">
                  <img src={imagePreviews[currentPreviewIndex]} alt={`preview-${currentPreviewIndex}`} className="w-full h-48 object-cover rounded-md" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    type="button"
                    onClick={() => removeImage(currentPreviewIndex)}
                    className="absolute top-3 right-3 w-9 h-9 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
                  >
                    <FaXmark className="text-lg" />
                  </button>
                  {imagePreviews.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentPreviewIndex(i => (i - 1 + imagePreviews.length) % imagePreviews.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow">
                        <FaChevronLeft className="text-lg" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentPreviewIndex(i => (i + 1) % imagePreviews.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow">
                        <FaChevronRight className="text-lg" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex gap-2 justify-center mt-3">
                  {imagePreviews.map((src, idx) => (
                    <button key={idx} onClick={() => setCurrentPreviewIndex(idx)} className={`w-20 h-12 overflow-hidden rounded-md ${idx === currentPreviewIndex ? 'ring-2 ring-blue-500' : 'opacity-80'}`}>
                      <img src={src} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  className="block border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <span className="text-2xl text-slate-400 dark:text-slate-500 mb-2 inline-block"><FaImage className="text-2xl" /></span>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Add more images</p>
                </motion.label>
              </div>
            )}
          </motion.div>

          {/* Editor Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-white card-bg"
          >
            <EditorToolbar editor={editor} />
            <EditorContent
              editor={editor}
              className="text-editor-content bg-[#FFFBEB] page-bg"
              style={{
                minHeight: '500px',
                padding: '24px'
              }}
            />
            <style>{`
              .text-editor-content {
                background-color: #FFFBEB;
              }
              .dark .text-editor-content {
                background-color: #1e293b;
              }
              .text-editor-content .ProseMirror {
                outline: none;
              }
              .text-editor-content .ProseMirror p {
                color: #0f172a;
                line-height: 1.75;
                margin-bottom: 1rem;
              }
              .dark .text-editor-content .ProseMirror p {
                color: #cbd5e1;
              }
              .text-editor-content .ProseMirror h1 {
                font-size: 2em;
                font-weight: bold;
                color: #0e141b;
                margin: 1.5rem 0 0.5rem;
              }
              .dark .text-editor-content .ProseMirror h1 {
                color: #f1f5f9;
              }
              .text-editor-content .ProseMirror h2 {
                font-size: 1.5em;
                font-weight: bold;
                color: #0e141b;
                margin: 1.25rem 0 0.5rem;
              }
              .dark .text-editor-content .ProseMirror h2 {
                color: #f1f5f9;
              }
              .text-editor-content .ProseMirror h3 {
                font-size: 1.25em;
                font-weight: bold;
                color: #0e141b;
                margin: 1rem 0 0.25rem;
              }
              .dark .text-editor-content .ProseMirror h3 {
                color: #f1f5f9;
              }
              .text-editor-content .ProseMirror a {
                color: #2563eb;
                text-decoration: underline;
              }
              .text-editor-content .ProseMirror strong {
                font-weight: bold;
                color: #0e141b;
              }
              .dark .text-editor-content .ProseMirror strong {
                color: #f1f5f9;
              }
              .text-editor-content .ProseMirror em {
                font-style: italic;
              }
              .text-editor-content .ProseMirror u {
                text-decoration: underline;
              }
              .text-editor-content .ProseMirror blockquote {
                border-left: 4px solid #cbd5e1;
                padding-left: 1rem;
                color: #4d7399;
                font-style: italic;
                margin: 1rem 0;
              }
              .dark .text-editor-content .ProseMirror blockquote {
                color: #94a3b8;
              }
              .text-editor-content .ProseMirror code {
                background-color: #f3f4f6;
                color: #0e141b;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-family: monospace;
              }
              .dark .text-editor-content .ProseMirror code {
                background-color: #0f172a;
                color: #60a5fa;
              }
              .text-editor-content .ProseMirror pre {
                background-color: #f3f4f6;
                color: #0e141b;
                padding: 1rem;
                border-radius: 0.5rem;
                overflow-x: auto;
                margin: 1rem 0;
              }
              .dark .text-editor-content .ProseMirror pre {
                background-color: #0f172a;
                color: #60a5fa;
              }
              .text-editor-content .ProseMirror pre code {
                background: none;
                color: inherit;
                padding: 0;
              }
              .text-editor-content .ProseMirror ul {
                list-style-type: disc;
                margin-left: 2rem;
                color: #0f172a;
              }
              .dark .text-editor-content .ProseMirror ul {
                color: #cbd5e1;
              }
              .text-editor-content .ProseMirror ol {
                list-style-type: decimal;
                margin-left: 2rem;
                color: #0f172a;
              }
              .dark .text-editor-content .ProseMirror ol {
                color: #cbd5e1;
              }
              .text-editor-content .ProseMirror li {
                margin-bottom: 0.5rem;
              }
              .text-editor-content .ProseMirror img {
                border-radius: 0.5rem;
                max-width: 100%;
                height: auto;
                margin: 1rem 0;
              }
            `}</style>
          </motion.div>

          {/* Metadata Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Category */}
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Category</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white card-bg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                value={categories[0] || ''}
                onChange={e => setCategories([e.target.value])}
                required
              >
                <option value="" disabled>Select a category</option>
                {availableCategories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Status</label>
              <select
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white card-bg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </motion.div>

          {/* Tags Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
          >
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Tags</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Enter tags separated by comma (e.g., javascript, react, web development)"
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white bg-white card-bg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Separate multiple tags with commas</p>
          </motion.div>
        </motion.form>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={title}
        content={content}
        images={imagePreviews}
        categories={categories}
        tags={tagInput.split(',').map(t => t.trim()).filter(Boolean)}
        availableCategories={availableCategories}
      />
    </div>
  );
};

export default CreateEditPost;