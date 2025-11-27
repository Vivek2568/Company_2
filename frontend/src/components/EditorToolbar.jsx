import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaBold, FaItalic, FaUnderline, FaHeading, 
  FaList, FaQuoteLeft, FaCode, FaLink 
} from 'react-icons/fa6';

const EditorToolbar = ({ editor }) => {
  if (!editor) return null;

  const toolButtons = [
    { icon: FaBold, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { icon: FaItalic, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { icon: FaUnderline, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline') },
    { icon: FaHeading, label: 'Heading', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { icon: FaList, label: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { icon: FaQuoteLeft, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
    { icon: FaCode, label: 'Code', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
    { icon: FaLink, label: 'Link', action: () => {
      const url = prompt('Enter URL:');
      if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, isActive: editor.isActive('link') },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 bg-slate-100 rounded-lg border border-slate-200 mb-4">
      {toolButtons.map((button, idx) => {
        const Icon = button.icon;
        return (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={button.action}
            title={button.label}
            className={`p-2 rounded transition ${
              button.isActive 
                ? 'bg-slate-900 text-white' 
                : 'bg-white text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Icon className="text-sm" />
          </motion.button>
        );
      })}
    </div>
  );
};

export default EditorToolbar;
