import React from 'react';

interface RefreshIconProps {
    className?: string;
}

export const RefreshIcon: React.FC<RefreshIconProps> = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        fill="currentColor" 
        viewBox="0 0 16 16"
        className={className}
    >
        <path d="M8 3a5 5 0 0 0-5 5v.5a.5.5 0 0 1-1 0V8a6 6 0 1 1 12 0 .5.5 0 0 1-1 0 5 5 0 0 0-5-5z"/>
        <path d="M8 4.5a.5.5 0 0 1 .5.5v3.5l2.354 2.354a.5.5 0 0 1-.708.708L7.5 8.707V5a.5.5 0 0 1 .5-.5z"/>
    </svg>
);