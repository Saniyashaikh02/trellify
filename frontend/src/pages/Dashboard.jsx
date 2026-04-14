import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BoardCard from '../components/BoardCard';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiLayout, FiGrid } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data);
    } catch (error) {
      toast.error('Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardTitle.trim()) {
      toast.error('Please enter a board title');
      return;
    }

    try {
      const response = await api.post('/boards', { title: newBoardTitle });
      setBoards([response.data, ...boards]);
      setShowCreateModal(false);
      setNewBoardTitle('');
      toast.success('Board created successfully');
    } catch (error) {
      toast.error('Failed to create board');
    }
  };

  const handleDeleteBoard = (boardId) => {
    setBoards(boards.filter(board => board._id !== boardId));
  };

  const handleUpdateBoard = (updatedBoard) => {
    setBoards(boards.map(board => 
      board._id === updatedBoard._id ? updatedBoard : board
    ));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FiGrid className="text-blue-600 text-xl animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              My Boards
            </h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}! Here are your workspaces.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <FiPlus />
            <span>Create Board</span>
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-4">
              <FiLayout className="text-blue-600 text-3xl" />
            </div>
            <p className="text-gray-500 text-lg">No boards yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first board to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 btn-primary"
            >
              Create Your First Board
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map(board => (
              <BoardCard
                key={board._id}
                board={board}
                onDelete={handleDeleteBoard}
                onUpdate={handleUpdateBoard}
              />
            ))}
          </div>
        )}

        {/* Create Board Modal */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-content">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiLayout className="text-blue-600 text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Board</h2>
                  </div>
                  <input
                    type="text"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    placeholder="Enter board title"
                    className="input-field mb-4"
                    autoFocus
                    onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createBoard}
                      className="btn-primary"
                    >
                      Create Board
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;