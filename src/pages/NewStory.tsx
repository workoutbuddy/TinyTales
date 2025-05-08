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
  'Magical Garden',
  'Dinosaur World',
  'Candy Land',
  'Pirate Ship',
  'Haunted House',
  'Fairy Forest',
  'Superhero City',
  'Arctic Adventure',
  'Time Travel',
  'Secret Laboratory',
  'Other',
];

const animalOptions = [
  'Dog',
  'Cat',
  'Dinosaur',
  'Dragon',
  'Unicorn',
  'Bear',
  'Elephant',
  'Lion',
  'Tiger',
  'Rabbit',
  'Horse',
  'Monkey',
  'Penguin',
  'Fox',
  'Wolf',
  'Owl',
  'Mouse',
  'Other',
];

const characterOptions = [
  {
    category: 'Marvel',
    characters: [
      'Spider-Man',
      'Captain America',
      'Iron Man',
      'Black Panther',
      'Captain Marvel',
      'Black Widow',
      'Ms. Marvel',
      'Scarlet Witch',
      'Shuri',
      'Wasp',
    ],
  },
  {
    category: 'Pixar',
    characters: [
      'Arlo', // The Good Dinosaur
      'Buzz Lightyear',
      'Woody',
      'Dory',
      'Merida', // Brave
      'Joy', // Inside Out
      'Sadness', // Inside Out
      'Riley', // Inside Out
      'Bo Peep',
      'Violet Parr', // The Incredibles
      'Elastigirl', // The Incredibles
    ],
  },
  {
    category: 'Toy Story',
    characters: [
      'Woody',
      'Buzz Lightyear',
      'Hamm',
      'Rex',
      'Jessie',
      'Bo Peep',
      'Dolly',
      'Trixie',
    ],
  },
  {
    category: 'Cars',
    characters: [
      'Lightning McQueen',
      'Mater',
      'Sheriff',
      'Doc Hudson',
      'Sally Carrera',
      'Cruz Ramirez',
      'Flo',
    ],
  },
  {
    category: 'Paddington & Peter Rabbit',
    characters: [
      'Paddington Bear',
      'Peter Rabbit',
      'Lily Bobtail',
      'Mrs. Tiggy-Winkle',
    ],
  },
  {
    category: 'Disney Princesses',
    characters: [
      'Elsa',
      'Anna',
      'Moana',
      'Rapunzel',
      'Belle',
      'Ariel',
      'Tiana',
      'Mulan',
      'Cinderella',
      'Aurora',
      'Snow White',
      'Pocahontas',
      'Jasmine',
      'Merida',
    ],
  },
  {
    category: 'Other Favorites',
    characters: [
      'Peppa Pig',
      'George Pig',
      'Dora the Explorer',
      'Doc McStuffins',
      'Bluey',
      'Bingo',
      'Minnie Mouse',
      'Mickey Mouse',
      'Goofy',
      'Donald Duck',
      'Daisy Duck',
      'Hello Kitty',
      'Barbie',
      'Mirabel Madrigal', // Encanto
      'Isabela Madrigal', // Encanto
      'Luisa Madrigal', // Encanto
    ],
  },
];

// Convert characterOptions to react-select grouped options
const characterSelectOptions = characterOptions.map(group => ({
  label: group.category,
  options: group.characters.map(character => ({ label: character, value: character }))
}));

const lifeLessons = [
  'Empathy',
  'Tolerance',
  'Kindness',
  'Honesty',
  'Perseverance',
  'Teamwork',
  'Gratitude',
  'Respect',
  'Courage',
  'Sharing',
];

const moods = [
  { value: 'bedtime', label: '🛏 Bedtime', description: 'Calm, gentle, soothing' },
  { value: 'silly', label: '🤪 Silly', description: 'Funny, playful' },
  { value: 'bold', label: '🧗 Bold', description: 'Adventurous, brave' },
  { value: 'curious', label: '🧠 Curious', description: 'Mysterious, discovery-focused' },
];

export const NewStory = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<StoryPreferences>({
    childName: '',
    favoriteAnimal: '',
    setting: '',
    characters: [],
    lifeLesson: '',
  });
  const [customSetting, setCustomSetting] = useState('');
  const [customAnimal, setCustomAnimal] = useState('');
  const [mood, setMood] = useState('bedtime');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Use custom setting if 'Other' is selected
    const finalSetting = preferences.setting === 'Other' ? customSetting : preferences.setting;
    // Use custom animal if 'Other' is selected
    const finalAnimal = preferences.favoriteAnimal === 'Other' ? customAnimal : preferences.favoriteAnimal;

    try {
      const storyId = await createStory({
        ...preferences,
        setting: finalSetting,
        favoriteAnimal: finalAnimal,
        mood,
      });
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
                  <select
                    value={preferences.favoriteAnimal}
                    onChange={e => setPreferences(p => ({ ...p, favoriteAnimal: e.target.value }))}
                  >
                    <option value="">None</option>
                    {animalOptions.map(animal => (
                      <option key={animal} value={animal}>{animal}</option>
                    ))}
                  </select>
                  {preferences.favoriteAnimal === 'Other' && (
                    <Input
                      mt={2}
                      placeholder="Enter your own animal"
                      value={customAnimal}
                      onChange={e => setCustomAnimal(e.target.value)}
                    />
                  )}
                </FormControl>

                <FormControl isRequired>
                  <HStack spacing={4}>
                    <Icon as={FaTree} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Story Setting</FormLabel>
                  </HStack>
                  <select
                    value={preferences.setting}
                    onChange={e => setPreferences(p => ({ ...p, setting: e.target.value }))}
                  >
                    <option value="">Select a setting</option>
                    {settings.map(setting => (
                      <option key={setting} value={setting}>{setting}</option>
                    ))}
                  </select>
                  {preferences.setting === 'Other' && (
                    <Input
                      mt={2}
                      placeholder="Enter your own setting"
                      value={customSetting}
                      onChange={e => setCustomSetting(e.target.value)}
                      isRequired
                    />
                  )}
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

                <FormControl isRequired>
                  <HStack spacing={4}>
                    <Icon as={FaUserFriends} w={6} h={6} color="brand.500" />
                    <FormLabel fontSize="lg">Life Lesson</FormLabel>
                  </HStack>
                  <select
                    name="lifeLesson"
                    value={preferences.lifeLesson}
                    onChange={handleChange}
                    style={{ padding: '12px', borderRadius: '8px', borderColor: '#b31aff', width: '100%', fontSize: '1.1rem' }}
                  >
                    <option value="">Choose a lesson</option>
                    {lifeLessons.map((lesson) => (
                      <option key={lesson} value={lesson}>
                        {lesson}
                      </option>
                    ))}
                  </select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mood & Tone</FormLabel>
                  <HStack spacing={2} wrap="wrap">
                    {moods.map(option => (
                      <Button
                        key={option.value}
                        variant={mood === option.value ? 'solid' : 'outline'}
                        colorScheme={mood === option.value ? 'brand' : 'gray'}
                        onClick={() => setMood(option.value)}
                        aria-label={option.label}
                        fontSize="lg"
                        px={4}
                        py={2}
                        minW="120px"
                        mb={2}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </HStack>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {moods.find(m => m.value === mood)?.description}
                  </Text>
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