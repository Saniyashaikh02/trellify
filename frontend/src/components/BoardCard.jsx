import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiEdit2, FiArrowRight, FiFolder } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const BoardCard = ({ board, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(board.title);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this board?')) {
      try {
        await api.delete(`/boards/${board._id}`);
        toast.success('Board deleted successfully');
        onDelete(board._id);
      } catch (error) {
        toast.error('Failed to delete board');
      }
    }
  };

  const handleUpdate = async () => {
    if (title.trim() && title !== board.title) {
      try {
        const response = await api.put(`/boards/${board._id}`, { title });
        toast.success('Board updated successfully');
        onUpdate(response.data);
        setIsEditing(false);
      } catch (error) {
        toast.error('Failed to update board');
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUpdate();
    }
  };

  return (
    <div className="group card hover:scale-[1.02] transition-all duration-200">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleUpdate}
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-semibold"
              autoFocus
            />
          ) : (
            <div className="flex items-center space-x-2 flex-1">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiFolder className="text-blue-600 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{board.title}</h3>
            </div>
          )}
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Edit board"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete board"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Created {new Date(board.createdAt).toLocaleDateString()}
          </span>
          <button
            onClick={() => navigate(`/board/${board._id}`)}
            className="inline-flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
          >
            <span>View Board</span>
            <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardCard;