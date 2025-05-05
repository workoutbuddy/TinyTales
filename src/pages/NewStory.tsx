import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Icon,
  HStack,
  Select,
  Fade
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { FaChild, FaPaw, FaTree } from 'react-icons/fa';
import { createStory } from '../services/storyService';
import { StoryPreferences } from '../types/story';
import Background from '../components/common/Background';

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

const settings = [
  'Enchanted Forest',
  'Space Station',
  'Underwater Kingdom',
  'Castle in the Clouds',
  'Jungle Adventure',
  'Desert Oasis',
  'Arctic Wonderland',
  'Magical Garden'
];

export const NewStory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<StoryPreferences>({
    childName: '',
    favoriteAnimal: '',
    setting: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const storyId = await createStory(preferences);
      navigate(`/story/${storyId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create story. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Background />
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="stretch">
          <Fade in={true}>
            <VStack spacing={4} align="center">
              <Heading
                as="h1"
                size="2xl"
                bgGradient="linear(to-r, brand.400, brand.600)"
                bgClip="text"
                textAlign="center"
              >
                Create Your Story
              </Heading>
              <Text
                fontSize="xl"
                textAlign="center"
                color="gray.600"
                maxW="2xl"
              >
                Let's create a magical story personalized for your child!
              </Text>
            </VStack>
          </Fade>

          <Fade in={true}>
            <Box
              as="form"
              onSubmit={handleSubmit}
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
                <FormControl isRequired>
                  <HStack spacing={4}>
                    <Icon as={FaChild} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Child's Name</FormLabel>
                  </HStack>
                  <Input
                    name="childName"
                    value={preferences.childName}
                    onChange={handleChange}
                    placeholder="Enter child's name"
                    size="lg"
                    _hover={{ borderColor: 'brand.400' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={4}>
                    <Icon as={FaPaw} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Favorite Animal</FormLabel>
                  </HStack>
                  <Input
                    name="favoriteAnimal"
                    value={preferences.favoriteAnimal}
                    onChange={handleChange}
                    placeholder="Enter favorite animal"
                    size="lg"
                    _hover={{ borderColor: 'brand.400' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={4}>
                    <Icon as={FaTree} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Story Setting</FormLabel>
                  </HStack>
                  <Select
                    name="setting"
                    value={preferences.setting}
                    onChange={handleChange}
                    placeholder="Choose a setting"
                    size="lg"
                    _hover={{ borderColor: 'brand.400' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  >
                    {settings.map((setting) => (
                      <option key={setting} value={setting}>
                        {setting}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Creating Story..."
                  _hover={{
                    transform: 'scale(1.02)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.2s"
                  animation={`${float} 3s ease-in-out infinite`}
                >
                  Start Story
                </Button>
              </VStack>
            </Box>
          </Fade>
        </VStack>
      </Container>
    </>
  );
}; 