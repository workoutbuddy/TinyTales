import React from 'react';
import { Box } from '@chakra-ui/react';

const BoldBg = () => (
  <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={-2} w="100vw" h="100vh" pointerEvents="none">
    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bgGradient)" />
      {/* Dynamic Shapes */}
      <g>
        {/* Pulsing Circle */}
        <circle cx="400" cy="300" r="100" fill="#4ecdc4" opacity="0.6">
          <animate attributeName="r" values="100;120;100" dur="3s" repeatCount="indefinite" />
        </circle>
        {/* Rotating Square */}
        <rect x="200" y="200" width="80" height="80" fill="#ff6b6b" opacity="0.6">
          <animate attributeName="transform" values="rotate(0 240 240); rotate(360 240 240)" dur="4s" repeatCount="indefinite" />
        </rect>
        {/* Moving Triangle */}
        <path d="M600,200 L650,300 L550,300 Z" fill="#ffd93d" opacity="0.6">
          <animate attributeName="transform" values="translate(0,0); translate(0,20); translate(0,0)" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
    </svg>
  </Box>
);

export default BoldBg; 