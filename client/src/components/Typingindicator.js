import React from 'react';

const TypingIndicator = ({ name }) => (
  <div className="absolute -top-14 left-4 z-50">
    <div className="flex items-center space-x-2 px-4 py-2.5 bg-white/95 rounded-xl shadow-lg border border-gray-100">
      <span className="text-sm text-gray-700 font-medium">{name} is typing</span>
      <div className="flex space-x-1 items-center">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" 
             style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" 
             style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" 
             style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;