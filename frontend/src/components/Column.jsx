import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd'; // ✅ FIXED
import TaskCard from './TaskCard';
import { FiList, FiLoader, FiCheckCircle } from 'react-icons/fi';

const Column = ({ title, tasks, status, onTaskUpdate, onTaskDelete }) => {

  const getStatusConfig = () => {
    switch (status) {
      case 'todo':
        return {
          icon: FiList,
          color: 'text-gray-700',
        };
      case 'doing':
        return {
          icon: FiLoader,
          color: 'text-yellow-700',
        };
      case 'done':
        return {
          icon: FiCheckCircle,
          color: 'text-green-700',
        };
      default:
        return {
          icon: FiList,
          color: 'text-gray-700',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className="bg-gray-100 p-4 rounded-lg min-h-[400px]">
      
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={config.color} />
          <h3 className="font-bold">{title}</h3>
        </div>
        <span>{tasks.length}</span>
      </div>

      {/* Droppable */}
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3 min-h-[300px]"
          >
            {tasks.map((task, index) => (
              
              // 🔥 IMPORTANT DRAGGABLE
              <Draggable
                key={task._id}
                draggableId={task._id.toString()} // MUST
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      onUpdate={onTaskUpdate}
                      onDelete={onTaskDelete}
                    />
                  </div>
                )}
              </Draggable>
            ))}

            {/* REQUIRED */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default Column;