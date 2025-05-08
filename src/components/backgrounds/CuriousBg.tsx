import React from 'react';
import { Box } from '@chakra-ui/react';

const CuriousBg = () => (
  <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={-2} w="100vw" h="100vh" pointerEvents="none">
    <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8e6cf" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3eadcf" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bgGradient)" />
      {/* Question Marks */}
      <g fill="#3eadcf" opacity="0.6">
        {/* Rotating Question Mark */}
        <text x="200" y="200" fontSize="60" fontFamily="Arial">?</text>
        <animate attributeName="transform" values="rotate(0 200 200); rotate(360 200 200)" dur="8s" repeatCount="indefinite" />
        {/* Floating Question Mark */}
        <text x="500" y="300" fontSize="40" fontFamily="Arial">?</text>
        <animate attributeName="transform" values="translate(0,0); translate(0,-20); translate(0,0)" dur="4s" repeatCount="indefinite" />
        {/* Small Question Marks */}
        <text x="100" y="400" fontSize="30" fontFamily="Arial">?</text>
        <text x="600" y="150" fontSize="30" fontFamily="Arial">?</text>
      </g>
      {/* Exploring Elements */}
      <g>
        {/* Magnifying Glass */}
        <circle cx="400" cy="400" r="40" fill="none" stroke="#3eadcf" strokeWidth="4" />
        <line x1="440" y1="440" x2="480" y2="480" stroke="#3eadcf" strokeWidth="4" />
      </g>
    </svg>
  </Box>
);

export default CuriousBg; 