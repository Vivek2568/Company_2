import React from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaArrowRightFromBracket } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const ProfileHeader = ({ 
  user, 
  onLogout, 
  isOwnProfile = false,
  showLogout = false
}) => {
  const navigate = useNavigate();

  return (
    <div className="md:col-span-1">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="sticky top-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center mb-3 overflow-hidden border-2 border-slate-200">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-xl font-serif font-bold text-slate-900 mb-0.5">{user.username}</h1>
        <p className="text-slate-600 text-xs mb-3 truncate">{user.email}</p>
        
        {isOwnProfile && (
          <div className="flex flex-col gap-1.5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/create-post')}
              className="w-full px-3 py-1.5 bg-slate-900 text-white rounded-full font-semibold text-sm hover:bg-slate-800 transition flex items-center justify-center gap-1"
            >
              <FaPlus className="text-xs" /> New
            </motion.button>
            {showLogout && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="w-full px-3 py-1.5 bg-slate-100 text-slate-900 rounded-full font-semibold text-sm hover:bg-slate-200 transition flex items-center justify-center gap-1 border border-slate-200"
              >
                <FaArrowRightFromBracket className="text-xs" /> Out
              </motion.button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileHeader;
