import React from 'react';

export default function SkeletonLoader({ rows = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-8 bg-slate-100 rounded-lg w-full"></div>
      ))}
    </div>
  );
}
