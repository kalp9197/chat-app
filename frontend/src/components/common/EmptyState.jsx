import React from 'react';

// Simple empty state component for lists
const EmptyState = ({ message, action, actionText, icon = '📫' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-gray-500 mb-4">{message}</p>
      {action && actionText && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
