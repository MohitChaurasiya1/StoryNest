import React from 'react';
import { FaTools } from 'react-icons/fa';

const ComingSoonPlaceholder = ({ title, description }) => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-24 h-24 bg-[var(--purple-light)] text-[var(--purple)] rounded-full flex items-center justify-center mb-6">
        <FaTools size={40} />
      </div>
      <h2 className="text-3xl font-bold mb-4">{title}</h2>
      <p className="text-muted text-lg text-center max-w-md">
        {description}
      </p>
      <div className="mt-8 pill pill-gold px-4 py-2 text-sm font-bold">
        Coming in the next implementation phase
      </div>
    </div>
  );
};

export default ComingSoonPlaceholder;
