import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, Image, HStack, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaMagic, FaRocket, FaDragon, FaPaw } from 'react-icons/fa';

const mascotUrl = 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_1280.png'; // Example mascot image (replace with your own if desired)

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <Box minH="100vh" bgGradient="linear(to-br, #a18cd1 0%, #fbc2eb 100%)" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.sm" py={10} bg="whiteAlpha.900" borderRadius="2xl" boxShadow="2xl">
        <VStack spacing={8}>
          <Image src={mascotUrl} alt="TinyTales Mascot" boxSize="120px" borderRadius="full" boxShadow="lg" />
          <Heading fontFamily="'Comic Sans MS', 'Comic Sans', cursive" size="2xl" color="purple.700" textAlign="center">
            Welcome to TinyTales!
          </Heading>
          <Text fontSize="xl" color="gray.700" textAlign="center">
            Create magical, interactive stories with animals, wizards, rockets, and fairy friends!
          </Text>
          <HStack spacing={6} fontSize="3xl" color="pink.400">
            <Icon as={FaPaw} />
            <Icon as={FaMagic} />
            <Icon as={FaRocket} />
            <Icon as={FaDragon} />
          </HStack>
          <Button
            w="full"
            colorScheme="pink"
            size="lg"
            fontSize="xl"
            bgGradient="linear(to-r, pink.400, purple.400)"
            _hover={{ bgGradient: 'linear(to-r, purple.400, pink.400)', transform: 'scale(1.05)' }}
            boxShadow="md"
            onClick={handleGoogleSignIn}
            leftIcon={<Icon as={FaMagic} />}
          >
            Sign in with Google
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login; 