import React from 'react';

const ArcticBackground: React.FC = () => (
  <svg width="100%" height="100%" viewBox="0 0 800 480" style={{ position: 'absolute', inset: 0, zIndex: 0 }} preserveAspectRatio="none">
    <defs>
      <linearGradient id="arctic-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e0f7fa" />
        <stop offset="100%" stopColor="#b3e5fc" />
      </linearGradient>
      <linearGradient id="arctic-water" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#b3e5fc" />
        <stop offset="100%" stopColor="#4fc3f7" />
      </linearGradient>
    </defs>
    {/* Sky */}
    <rect x="0" y="0" width="800" height="300" fill="url(#arctic-sky)" />
    {/* Water */}
    <rect x="0" y="300" width="800" height="180" fill="url(#arctic-water)" />
    {/* Icebergs */}
    <ellipse cx="200" cy="340" rx="90" ry="30" fill="#fff" opacity="0.8" />
    <ellipse cx="600" cy="370" rx="70" ry="22" fill="#e0f7fa" opacity="0.7" />
    {/* Snowflakes */}
    {[...Array(12)].map((_, i) => (
      <circle key={i} cx={60 + i * 60} cy={40 + (i % 2) * 30} r={4 + (i % 3)} fill="#fff" opacity="0.7" />
    ))}
    {/* Polar Bear */}
    <ellipse cx="400" cy="370" rx="38" ry="22" fill="#fff" />
    <ellipse cx="420" cy="370" rx="10" ry="8" fill="#fff" />
    <ellipse cx="385" cy="360" rx="7" ry="7" fill="#fff" />
    <circle cx="390" cy="358" r="2" fill="#333" />
    <ellipse cx="380" cy="370" rx="3" ry="2" fill="#fff" />
    <ellipse cx="410" cy="380" rx="5" ry="2" fill="#fff" />
  </svg>
);

export default ArcticBackground; 