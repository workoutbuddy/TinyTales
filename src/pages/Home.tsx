import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, HStack, Icon, SimpleGrid } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaBook, FaMagic, FaVolumeUp, FaChild } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import Background from '../components/common/Background';

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const FeatureCard = ({ icon, title, description }: { icon: any; title: string; description: string }) => (
  <Box
    p={6}
    bg="white"
    borderRadius="xl"
    boxShadow="lg"
    position="relative"
    _hover={{
      transform: 'translateY(-5px)',
      boxShadow: 'xl',
    }}
    transition="all 0.3s"
    animation={`${float} 3s ease-in-out infinite`}
  >
    <VStack spacing={4} align="center">
      <Icon as={icon} w={10} h={10} color="brand.500" />
      <Heading size="md" color="brand.600">{title}</Heading>
      <Text textAlign="center" color="gray.600">{description}</Text>
    </VStack>
  </Box>
);

export const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Background />
      <Container maxW="container.xl" py={10}>
        <VStack spacing={12} align="center">
          {/* Hero Section */}
          <VStack spacing={6} align="center" maxW="3xl">
            <Box
              animation={`${bounce} 2s ease-in-out infinite`}
              transition="all 0.3s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              <Heading
                as="h1"
                size="3xl"
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                textShadow="2px 2px 4px rgba(0,0,0,0.1)"
                textAlign="center"
              >
                TinyTales
              </Heading>
            </Box>
            <Text
              fontSize="2xl"
              textAlign="center"
              color="gray.600"
              fontWeight="medium"
              maxW="2xl"
            >
              Create magical, interactive stories that spark your child's imagination
            </Text>
            <Button
              colorScheme="brand"
              size="lg"
              px={8}
              onClick={() => navigate('/story/new')}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Start a New Story
            </Button>
          </VStack>

          {/* Features Section */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            <FeatureCard
              icon={FaBook}
              title="Interactive Stories"
              description="Make choices that shape the story's path and create unique adventures"
            />
            <FeatureCard
              icon={FaMagic}
              title="AI-Powered"
              description="Stories generated with GPT-4 and illustrated with DALL·E 3"
            />
            <FeatureCard
              icon={FaVolumeUp}
              title="Voice Narration"
              description="Listen to stories with natural-sounding text-to-speech"
            />
            <FeatureCard
              icon={FaChild}
              title="Personalized"
              description="Include your child's name and favorite things in the story"
            />
          </SimpleGrid>

          {/* How It Works Section */}
          <Box
            w="full"
            maxW="4xl"
            p={8}
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '-2px',
              left: '-2px',
              right: '-2px',
              bottom: '-2px',
              bg: 'brand.200',
              borderRadius: '2xl',
              zIndex: -1,
              opacity: 0.5,
            }}
          >
            <VStack spacing={6}>
              <Heading size="lg" color="brand.600">How It Works</Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="brand.500">1. Create</Text>
                  <Text textAlign="center">Enter your child's name and preferences</Text>
                </VStack>
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="brand.500">2. Read</Text>
                  <Text textAlign="center">Enjoy the story with beautiful illustrations</Text>
                </VStack>
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="brand.500">3. Choose</Text>
                  <Text textAlign="center">Make choices that shape the story's path</Text>
                </VStack>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* CTA Section */}
          <Box textAlign="center">
            <Button
              colorScheme="brand"
              size="lg"
              onClick={() => navigate('/story/new')}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Start Your Story Now
            </Button>
          </Box>
        </VStack>
      </Container>
    </>
  );
}; 