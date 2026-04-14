import React, { useState } from 'react';
import { format, isBefore, differenceInDays } from 'date-fns';
import {
  FiTrash2,
  FiEdit2,
  FiCalendar,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.split('T')[0] : ''
  );

  // =============================
  // UPDATE TASK
  // =============================
  const handleUpdate = async () => {
    try {
      const response = await api.put(`/tasks/${task._id}`, {
        title,
        description,
        dueDate: dueDate || null,
      });

      toast.success('Task updated successfully');
      onUpdate(response.data);
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  // =============================
  // DELETE TASK
  // =============================
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${task._id}`);
        toast.success('Task deleted successfully');
        onDelete(task._id);
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  // =============================
  // DATE LOGIC
  // =============================
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;

    const dueDateObj = new Date(task.dueDate);
    const today = new Date();
    const daysLeft = differenceInDays(dueDateObj, today);

    let statusText = '';
    let color = '';
    let icon = null;

    if (task.status === 'done') {
      statusText = 'Completed';
      color = 'text-green-500';
    } else if (isBefore(dueDateObj, today)) {
      statusText = 'Overdue';
      color = 'text-red-500';
      icon = FiAlertCircle;
    } else if (daysLeft === 0) {
      statusText = 'Due today';
      color = 'text-orange-500';
      icon = FiClock;
    } else {
      statusText = `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`;
      color = daysLeft <= 2 ? 'text-orange-500' : 'text-gray-500';
    }

    return {
      formattedDate: format(dueDateObj, 'MMM dd, yyyy'),
      statusText,
      color,
      icon,
    };
  };

  const dueDateStatus = getDueDateStatus();

  // =============================
  // PRIORITY + OVERDUE
  // =============================
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const priorityStyles =
    task.priority === 'high'
      ? 'border-red-400 bg-red-50'
      : task.priority === 'medium'
      ? 'border-yellow-400 bg-yellow-50'
      : 'bg-white border-gray-200';

  // =============================
  // EDIT MODE
  // =============================
  if (isEditing) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-md border border-gray-200 p-4"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field mb-2"
          placeholder="Task title"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field mb-2"
          placeholder="Description"
        />

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="input-field mb-3"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdate}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </motion.div>
    );
  }

  // =============================
  // DISPLAY MODE
  // =============================
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-xl shadow-sm border transition-all duration-200
      hover:shadow-md hover:-translate-y-1 cursor-grab active:cursor-grabbing
      ${priorityStyles}
      ${isOverdue ? 'ring-2 ring-red-400' : ''}
      `}
    >

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-gray-800">
          {task.title}
        </h4>

        <div className="flex gap-2">
          <button onClick={() => setIsEditing(true)}>
            <FiEdit2 size={14} />
          </button>

          <button onClick={handleDelete}>
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* PRIORITY BADGE */}
      <div className="mt-2">
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            task.priority === 'high'
              ? 'bg-red-100 text-red-600'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {task.priority || 'low'}
        </span>
      </div>

      {/* DESCRIPTION */}
      {task.description && (
        <p className="text-sm text-gray-600 mt-2">
          {task.description}
        </p>
      )}

      {/* DATE */}
      {dueDateStatus && (
        <div className={`mt-3 text-xs ${dueDateStatus.color}`}>

          <div className="flex items-center">
            <FiCalendar className="mr-1" size={12} />
            {dueDateStatus.formattedDate}
          </div>

          <div className="flex items-center mt-1">
            <span>{dueDateStatus.statusText}</span>

            {dueDateStatus.icon && (
              <dueDateStatus.icon className="ml-1" size={12} />
            )}
          </div>

        </div>
      )}

      {/* STATUS */}
      <div className="mt-3">
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            task.status === 'todo'
              ? 'bg-gray-200 text-gray-700'
              : task.status === 'doing'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-green-100 text-green-600'
          }`}
        >
          {task.status === 'todo'
            ? 'To Do'
            : task.status === 'doing'
            ? 'In Progress'
            : 'Completed'}
        </span>
      </div>

    </motion.div>
  );
};

export default TaskCard;