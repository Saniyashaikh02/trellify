import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import Navbar from '../components/Navbar';
import Column from '../components/Column';
import TaskAnalytics from '../components/TaskAnalytics';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus } from 'react-icons/fi';

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  useEffect(() => {
    fetchBoard();
  }, [id]);

  // =============================
  // FETCH BOARD
  // =============================
  const fetchBoard = async () => {
    try {
      const response = await api.get(`/boards/${id}`);
      setBoard(response.data.board);
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error('Failed to fetch board');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // PRIORITY
  // =============================
  const getPriority = (dueDate) => {
    if (!dueDate) return 'low';

    const today = new Date();
    const due = new Date(dueDate);

    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff <= 0) return 'high';
    if (diff <= 2) return 'medium';
    return 'low';
  };

  // =============================
  // STATS
  // =============================
  const getStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const pending = total - completed;

    const overdue = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'done';
    }).length;

    const highPriority = tasks.filter(t => t.priority === 'high').length;

    return { total, completed, pending, overdue, highPriority };
  };

  // =============================
  // SORT
  // =============================
  const sortTasks = (tasks) => {
    const order = { high: 1, medium: 2, low: 3 };

    return [...tasks].sort((a, b) => {
      return (order[a.priority] || 3) - (order[b.priority] || 3);
    });
  };

  // =============================
  // DRAG
  // =============================
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId;

    const updatedTasks = tasks.map((t) =>
      t._id === draggableId ? { ...t, status: newStatus } : t
    );

    setTasks(updatedTasks);

    try {
      await api.patch(`/tasks/${draggableId}/status`, { status: newStatus });
      toast.success('Task updated');
    } catch (error) {
      setTasks(tasks);
      toast.error('Failed to update task');
    }
  };

  // =============================
  // CREATE TASK
  // =============================
  const createTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Enter title');
      return;
    }

    try {
      const priority = getPriority(newTask.dueDate);

      const response = await api.post('/tasks', {
        ...newTask,
        boardId: id,
        status: 'todo',
        priority,
      });

      setTasks([response.data, ...tasks]);

      setShowCreateModal(false);
      setNewTask({ title: '', description: '', dueDate: '' });

      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task =>
      task._id === updatedTask._id ? updatedTask : task
    ));
  };

  const handleTaskDelete = (taskId) => {
    setTasks(tasks.filter(task => task._id !== taskId));
  };

  const getTasksByStatus = (status) => {
    return sortTasks(tasks.filter(task => task.status === status));
  };

  const stats = getStats();

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  const columns = [
    { title: 'To Do', status: 'todo' },
    { title: 'In Progress', status: 'doing' },
    { title: 'Done', status: 'done' },
  ];

  return (
    <>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="hover:scale-110 transition"
            >
              <FiArrowLeft size={20} />
            </button>

            <h1 className="text-2xl font-bold">
              {board?.title}
            </h1>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 hover:scale-105 hover:shadow-lg transition"
          >
            <FiPlus /> Add Task
          </button>
        </div>

        {/* STATS WITH FULL HOVER */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

          <div className="p-4 bg-gray-800 text-white rounded-lg shadow hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
            <p>Total</p>
            <h2 className="text-xl font-bold">{stats.total}</h2>
          </div>

          <div className="p-4 bg-green-100 rounded-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
            <p>Completed</p>
            <h2>{stats.completed}</h2>
          </div>

          <div className="p-4 bg-yellow-100 rounded-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
            <p>Pending</p>
            <h2>{stats.pending}</h2>
          </div>

          <div className="p-4 bg-red-100 rounded-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
            <p>Overdue ⚠️</p>
            <h2>{stats.overdue}</h2>
          </div>

          <div className="p-4 bg-orange-100 rounded-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer">
            <p>High Priority 🔥</p>
            <h2>{stats.highPriority}</h2>
          </div>

        </div>

        <TaskAnalytics tasks={tasks} />

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((col) => (
              <Column
                key={col.status}
                title={col.title}
                tasks={getTasksByStatus(col.status)}
                status={col.status}
                onTaskUpdate={handleTaskUpdate}
                onTaskDelete={handleTaskDelete}
              />
            ))}
          </div>
        </DragDropContext>

        {/* MODAL */}
        {showCreateModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-content p-6">

                <h2 className="text-xl font-bold mb-4">
                  Create Task
                </h2>

                <input
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Title"
                  className="input-field mb-2"
                />

                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Description"
                  className="input-field mb-2"
                />

                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask({ ...newTask, dueDate: e.target.value })
                  }
                  className="input-field mb-4"
                />

                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>

                  <button onClick={createTask} className="btn-primary">
                    Create
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Board;