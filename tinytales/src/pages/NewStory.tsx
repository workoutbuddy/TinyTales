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
  Fade
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { FaChild, FaPaw, FaTree, FaUserFriends } from 'react-icons/fa';
import { createStory } from '../services/storyService';
import { StoryPreferences } from '../types/story';
import Background from '../components/common/Background';
import Select from 'react-select';

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

const characterOptions = [
  {
    category: 'Marvel',
    characters: [
      'A superhero with a red suit and web powers',
      'A hero with a star shield',
      'A genius in a flying metal suit',
      'A fierce warrior from a hidden kingdom',
    ],
  },
  {
    category: 'Pixar',
    characters: [
      'A friendly green dinosaur',
      'A space ranger with a green suit',
      'A cowboy toy with a big hat',
      'A forgetful blue fish',
    ],
  },
  {
    category: 'Toy Story',
    characters: [
      'A cowboy toy with a big hat',
      'A space ranger with a green suit',
      'A piggy bank that talks',
      'A nervous green dinosaur toy',
    ],
  },
  {
    category: 'Cars',
    characters: [
      'A red race car who loves to go fast',
      'A rusty but loyal tow truck',
      'A strict but fair police car',
      'A wise old racing coach',
    ],
  },
  {
    category: 'Paddington & Peter Rabbit',
    characters: [
      'A friendly bear in a blue coat and red hat',
      'A brave rabbit in a blue jacket',
    ],
  },
];

// Convert characterOptions to react-select grouped options
const characterSelectOptions = characterOptions.map(group => ({
  label: group.category,
  options: group.characters.map(character => ({ label: character, value: character }))
}));

export const NewStory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<StoryPreferences>({
    childName: '',
    favoriteAnimal: '',
    setting: '',
    characters: [],
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
                  <select
                    name="setting"
                    value={preferences.setting}
                    onChange={handleChange}
                    style={{ padding: '12px', borderRadius: '8px', borderColor: '#b31aff', width: '100%', fontSize: '1.1rem' }}
                  >
                    <option value="">Choose a setting</option>
                    {settings.map((setting) => (
                      <option key={setting} value={setting}>
                        {setting}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormControl>
                  <HStack spacing={4} mb={2}>
                    <Icon as={FaUserFriends} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Favorite Characters (choose one or more)</FormLabel>
                  </HStack>
                  <Select
                    isMulti
                    name="characters"
                    options={characterSelectOptions}
                    classNamePrefix="react-select"
                    value={characterSelectOptions
                      .flatMap(group => group.options)
                      .filter(option => preferences.characters.includes(option.value))}
                    onChange={(selected) => {
                      setPreferences(prev => ({
                        ...prev,
                        characters: selected ? (Array.isArray(selected) ? selected.map(option => option.value) : []) : []
                      }));
                    }}
                    placeholder="Choose characters (optional)"
                    styles={{
                      control: (base) => ({ ...base, minHeight: '48px', borderColor: '#b31aff', boxShadow: 'none' }),
                      multiValue: (base) => ({ ...base, backgroundColor: '#e6b3ff', color: '#5c0080' }),
                      multiValueLabel: (base) => ({ ...base, color: '#5c0080' }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#d680ff' : state.isFocused ? '#f5e6ff' : undefined,
                        color: '#3d004d',
                      }),
                    }}
                  />
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