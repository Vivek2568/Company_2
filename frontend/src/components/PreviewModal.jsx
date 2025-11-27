import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

const PreviewModal = ({ isOpen, onClose, title, content, images, categories, tags, availableCategories, availableTags }) => {
  const [previewIndex, setPreviewIndex] = useState(0);

  const nextImage = () => {
    if (images && images.length > 0) {
      setPreviewIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setPreviewIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!isOpen) return null;

  const currentImage = images?.[previewIndex] 
    ? (typeof images[previewIndex] === 'string' && images[previewIndex].startsWith('blob:') || images[previewIndex].startsWith('http') 
        ? images[previewIndex]
        : `http://localhost:5000/uploads/${images[previewIndex]}`)
    : null;

  const getCategoryLabel = (id) => {
    return availableCategories?.find(c => c._id === id)?.name || id;
  };

  const getTagLabel = (id) => {
    return availableTags?.find(t => t._id === id)?.name || id;
  };

  const hiddenScrollbarStyle = `
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{hiddenScrollbarStyle}</style>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-4xl max-h-[85vh] overflow-auto rounded-2xl bg-white shadow-2xl pointer-events-auto hide-scrollbar">
            {/* Header */}
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 md:px-8">
              <h2 className="text-2xl font-bold text-slate-900">Preview</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100 transition"
              >
                <FaXmark className="text-xl" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
              {/* Images */}
              {images && images.length > 0 && (
                <div className="mb-8">
                  <div className="relative mb-4 h-[500px] w-full overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={currentImage}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition"
                        >
                          <FaChevronLeft />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 hover:bg-white transition"
                        >
                          <FaChevronRight />
                        </motion.button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                          {previewIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <h1 className="mb-4 text-4xl font-bold text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
                {title || 'Untitled Post'}
              </h1>

              {/* Metadata */}
              <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
                {categories && categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Categories:</span>
                    {categories.map((cat) => (
                      <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getCategoryLabel(cat)}
                      </span>
                    ))}
                  </div>
                )}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="font-medium">Tags:</span>
                    {tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getTagLabel(tag)}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div 
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PreviewModal;
