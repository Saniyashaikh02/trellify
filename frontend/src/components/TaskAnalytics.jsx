import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TaskAnalytics = ({ tasks }) => {
  const data = [
    {
      name: 'To Do',
      value: tasks.filter(t => t.status === 'todo').length,
    },
    {
      name: 'In Progress',
      value: tasks.filter(t => t.status === 'doing').length,
    },
    {
      name: 'Done',
      value: tasks.filter(t => t.status === 'done').length,
    },
  ];

  const COLORS = ['#94a3b8', '#3b82f6', '#22c55e'];

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">

      {/* TITLE */}
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        📊 Task Analytics
      </h2>

      {/* CHART */}
      <div className="h-64 flex flex-col items-center justify-center">

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              outerRadius={90}
              innerRadius={45} // 🔥 donut chart
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>

            <Tooltip />

          </PieChart>
        </ResponsiveContainer>

        {/* CENTER LABEL */}
        <p className="text-sm text-gray-500 mt-2">
          Task Distribution
        </p>

      </div>

    </div>
  );
};

export default TaskAnalytics;