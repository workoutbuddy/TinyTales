import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, Image, HStack, Icon } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FaMagic, FaRocket, FaDragon, FaPaw } from 'react-icons/fa';
import { useMood } from '../theme/MoodContext';

const mascotUrl = 'https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_1280.png'; // Example mascot image (replace with your own if desired)

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useMood();

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
    <Box minH="100vh" bgGradient={theme.bgGradient} fontFamily={theme.font} color={theme.text} display="flex" alignItems="center" justifyContent="center">
      <Container maxW="container.sm" py={10} bg={theme.cardBg} borderRadius="2xl" boxShadow="2xl">
        <VStack spacing={8}>
          <Image src={mascotUrl} alt="TinyTales Mascot" boxSize="120px" borderRadius="full" boxShadow="lg" />
          <Heading fontFamily={theme.font} size="2xl" color={theme.accent} textAlign="center">
            Welcome to TinyTales!
          </Heading>
          <Text fontSize="xl" color={theme.text} textAlign="center">
            Create magical, interactive stories with animals, wizards, rockets, and fairy friends!
          </Text>
          <HStack spacing={6} fontSize="3xl" color={theme.accent}>
            <Icon as={FaPaw} />
            <Icon as={FaMagic} />
            <Icon as={FaRocket} />
            <Icon as={FaDragon} />
          </HStack>
          <Button
            w="full"
            size="lg"
            fontSize="xl"
            bg={theme.button.bg}
            color={theme.button.color}
            _hover={{ bg: theme.accent, transform: 'scale(1.05)' }}
            boxShadow="md"
            onClick={handleGoogleSignIn}
            leftIcon={<Icon as={FaMagic} />}
            fontFamily={theme.font}
          >
            Sign in with Google
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login; 