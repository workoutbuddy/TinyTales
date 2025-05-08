import React from 'react';
import { Box } from '@chakra-ui/react';

const SillyBg = () => (
  <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={-2} w="100vw" h="100vh" pointerEvents="none">
    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff6b7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f6416c" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bgGradient)" />
      {/* Bouncing Stars */}
      <g fill="#f9c846">
        <path d="M100,100 L120,80 L140,100 L120,120 Z">
          <animate attributeName="transform" values="translate(0,0); translate(0,-20); translate(0,0)" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M300,200 L320,180 L340,200 L320,220 Z">
          <animate attributeName="transform" values="translate(0,0); translate(0,-20); translate(0,0)" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M500,150 L520,130 L540,150 L520,170 Z">
          <animate attributeName="transform" values="translate(0,0); translate(0,-20); translate(0,0)" dur="1.8s" repeatCount="indefinite" />
        </path>
      </g>
      {/* Fun Shapes */}
      <circle cx="200" cy="400" r="40" fill="#f6416c" opacity="0.6">
        <animate attributeName="r" values="40;45;40" dur="3s" repeatCount="indefinite" />
      </circle>
      <rect x="400" y="350" width="60" height="60" fill="#f9c846" opacity="0.6">
        <animate attributeName="transform" values="rotate(0 430 380); rotate(360 430 380)" dur="4s" repeatCount="indefinite" />
      </rect>
    </svg>
  </Box>
);

export default SillyBg; 