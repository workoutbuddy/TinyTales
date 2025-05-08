import React from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-40px); }
  100% { transform: translateY(0); }
`;

const twinkle = [
  keyframes`0%{opacity:0.3;} 50%{opacity:1;} 100%{opacity:0.3;}`,
  keyframes`0%{opacity:0.3;} 50%{opacity:0.8;} 100%{opacity:0.3;}`,
  keyframes`0%{opacity:0.3;} 50%{opacity:0.6;} 100%{opacity:0.3;}`,
  keyframes`0%{opacity:0.3;} 50%{opacity:0.9;} 100%{opacity:0.3;}`,
  keyframes`0%{opacity:0.3;} 50%{opacity:0.7;} 100%{opacity:0.3;}`,
];

const BedtimeBg = () => (
  <Box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={-2} w="100vw" h="100vh" pointerEvents="none">
    {/* Gradient background as SVG */}
    <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#232946" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#5f6caf" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bgGradient)" />
    </svg>
    {/* Moon - much larger and central for debug */}
    <Box
      position="absolute"
      left="60%"
      top="20%"
      w="180px"
      h="180px"
      borderRadius="full"
      bg="#b8c1ec"
      border="4px solid #fff"
      display="block"
      opacity={1}
      animation={`${float} 4s ease-in-out infinite`}
      zIndex={-1}
    />
    {/* Stars - larger, with border for debug */}
    <Box position="absolute" left="12%" top="18%" w="24px" h="24px" borderRadius="full" bg="#f4f4f4" border="2px solid #f9c846" display="block" animation={`${twinkle[0]} 2s infinite`} />
    <Box position="absolute" left="25%" top="30%" w="16px" h="16px" borderRadius="full" bg="#f4f4f4" border="2px solid #f9c846" display="block" animation={`${twinkle[1]} 2.5s infinite`} />
    <Box position="absolute" left="37%" top="10%" w="32px" h="32px" borderRadius="full" bg="#f4f4f4" border="2px solid #f9c846" display="block" animation={`${twinkle[2]} 1.8s infinite`} />
    <Box position="absolute" left="50%" top="22%" w="24px" h="24px" borderRadius="full" bg="#f4f4f4" border="2px solid #f9c846" display="block" animation={`${twinkle[3]} 2.2s infinite`} />
    <Box position="absolute" left="70%" top="15%" w="16px" h="16px" borderRadius="full" bg="#f4f4f4" border="2px solid #f9c846" display="block" animation={`${twinkle[4]} 2.7s infinite`} />
  </Box>
);

export default BedtimeBg; 