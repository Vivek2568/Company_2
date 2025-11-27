import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaXmark, FaUser, FaUsers } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

const UserListModal = ({ isOpen, onClose, title, users, emptyIcon: EmptyIcon, emptyTitle, emptyMessage }) => {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md max-h-[80vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition"
              >
                <FaXmark className="text-slate-600" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {users.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <EmptyIcon className="text-4xl text-slate-300 mb-3" />
                  <p className="text-slate-600 font-medium">{emptyTitle}</p>
                  <p className="text-slate-500 text-sm mt-1">{emptyMessage}</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <motion.div
                      key={user._id}
                      whileHover={{ backgroundColor: '#f8fafc' }}
                      onClick={() => {
                        navigate(`/users/${user._id}`);
                        onClose();
                      }}
                      className="p-4 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition">{user.username}</p>
                          <p className="text-xs text-slate-500">@{user.username}</p>
                        </div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="text-blue-600 text-sm font-medium"
                      >
                        →
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserListModal;
