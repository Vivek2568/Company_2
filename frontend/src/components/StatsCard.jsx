import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ value, label, delay = 0, onClick = null, isClickable = false, textColor = 'text-slate-900' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`border border-slate-200 rounded-lg p-2.5 hover:border-slate-300 ${
        isClickable ? 'hover:shadow-sm transition cursor-pointer group' : 'transition'
      } text-center`}
    >
      <div className={`text-2xl font-bold ${textColor} ${isClickable ? 'group-hover:text-blue-600 transition' : ''}`}>
        {value}
      </div>
      <div className={`text-xs mt-0.5 ${isClickable ? 'text-slate-600 group-hover:text-slate-900 transition' : 'text-slate-600'}`}>
        {label}
      </div>
    </motion.div>
  );
};

export default StatsCard;
