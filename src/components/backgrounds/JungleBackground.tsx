import React from 'react';

const JungleBackground: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 480" style={{ position: 'absolute', inset: 0, zIndex: 0 }} preserveAspectRatio="none">
    <defs>
      <linearGradient id="jungle-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e8f5e9" />
        <stop offset="100%" stopColor="#a5d6a7" />
      </linearGradient>
      <linearGradient id="jungle-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#81c784" />
        <stop offset="100%" stopColor="#388e3c" />
      </linearGradient>
    </defs>
    {/* Sky */}
    <rect x="0" y="0" width="800" height="320" fill="url(#jungle-sky)" />
    {/* Ground */}
    <rect x="0" y="320" width="800" height="160" fill="url(#jungle-ground)" />
    {/* Leaves */}
    {[...Array(8)].map((_, i) => (
      <ellipse key={i} cx={60 + i * 90} cy={60 + (i % 2) * 30} rx="50" ry="18" fill="#388e3c" opacity="0.7" />
    ))}
    {/* Vines */}
    <path d="M100,0 Q120,80 200,120 Q300,180 400,60 Q500,-40 700,100" stroke="#388e3c" strokeWidth="6" fill="none" opacity="0.5" />
    {/* Monkey */}
    <ellipse cx="650" cy="370" rx="28" ry="22" fill="#a1887f" />
    <ellipse cx="650" cy="390" rx="18" ry="12" fill="#fffde7" />
    <ellipse cx="635" cy="365" rx="7" ry="7" fill="#a1887f" />
    <ellipse cx="665" cy="365" rx="7" ry="7" fill="#a1887f" />
    <ellipse cx="650" cy="380" rx="10" ry="8" fill="#fffde7" />
    <circle cx="645" cy="375" r="2" fill="#333" />
    <circle cx="655" cy="375" r="2" fill="#333" />
    <ellipse cx="650" cy="395" rx="4" ry="2" fill="#a1887f" />
  </svg>
);

export default JungleBackground; 