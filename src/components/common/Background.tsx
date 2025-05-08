import React from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useMood } from '../../theme/MoodContext';
import BedtimeBg from '../backgrounds/BedtimeBg';
import SillyBg from '../backgrounds/SillyBg';
import BoldBg from '../backgrounds/BoldBg';
import CuriousBg from '../backgrounds/CuriousBg';

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const moodBgMap: Record<string, React.ReactNode> = {
  bedtime: <BedtimeBg />,
  silly: <SillyBg />,
  bold: <BoldBg />,
  curious: <CuriousBg />,
};

const Background = () => {
  const { theme } = useMood();
  const moodKey = theme.name.toLowerCase();
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={-1}
      overflow="hidden"
      bg="gray.50"
    >
      {/* Mood-based background illustration (inline SVG for animation) */}
      {moodBgMap[moodKey]}
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        w="100px"
        h="100px"
        bg="brand.100"
        borderRadius="full"
        opacity={0.3}
        animation={`${float} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        top="20%"
        right="10%"
        w="150px"
        h="150px"
        bg="brand.200"
        borderRadius="full"
        opacity={0.2}
        animation={`${float} 8s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="15%"
        left="15%"
        w="120px"
        h="120px"
        bg="brand.300"
        borderRadius="full"
        opacity={0.25}
        animation={`${float} 7s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="25%"
        right="20%"
        w="80px"
        h="80px"
        bg="brand.400"
        borderRadius="full"
        opacity={0.15}
        animation={`${spin} 20s linear infinite`}
      />
    </Box>
  );
};

export default Background; 