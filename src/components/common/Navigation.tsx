import React from 'react';
import { Box, Button, Flex, Heading, Spacer } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/firebase';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box as="nav" bg="blue.500" px={4} py={2}>
      <Flex align="center">
        <Heading size="md" color="white" cursor="pointer" onClick={() => navigate('/')}>
          TinyTales
        </Heading>
        <Spacer />
        {user && (
          <Button
            colorScheme="whiteAlpha"
            variant="outline"
            onClick={handleSignOut}
            ml={4}
          >
            Sign Out
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default Navigation; 