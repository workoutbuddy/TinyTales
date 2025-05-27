import React, { useState } from 'react';
import {
  Box, Heading, Text, Input, Button, VStack, Progress, Select as ChakraSelect, HStack, Icon, useToast, Container
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaChild, FaPaw, FaTree, FaUserFriends, FaBook, FaSmile, FaFeatherAlt } from 'react-icons/fa';
import { createStory } from '../services/storyService';
import { useNavigate } from 'react-router-dom';
import { useMood } from '../theme/MoodContext';
import Select from 'react-select';
import ArcticBackground from './backgrounds/ArcticBackground';
import JungleBackground from './backgrounds/JungleBackground';

// --- Options (copied from NewStory.tsx) ---
const animalOptions = [
  'Dog', 'Cat', 'Dinosaur', 'Dragon', 'Unicorn', 'Bear', 'Elephant', 'Lion', 'Tiger', 'Rabbit', 'Horse', 'Monkey', 'Penguin', 'Fox', 'Wolf', 'Owl', 'Mouse', 'Other',
];
const settings = [
  'Enchanted Forest', 'Space Station', 'Underwater Kingdom', 'Castle in the Clouds', 'Jungle Adventure', 'Desert Oasis', 'Arctic Wonderland', 'Magical Garden', 'Dinosaur World', 'Candy Land', 'Pirate Ship', 'Haunted House', 'Fairy Forest', 'Superhero City', 'Arctic Adventure', 'Time Travel', 'Secret Laboratory', 'Other',
];
const characterOptions = [
  { category: 'Marvel', characters: ['Spider-Man', 'Captain America', 'Iron Man', 'Black Panther', 'Captain Marvel', 'Black Widow', 'Ms. Marvel', 'Scarlet Witch', 'Shuri', 'Wasp'] },
  { category: 'Pixar', characters: ['Arlo', 'Buzz Lightyear', 'Woody', 'Dory', 'Merida', 'Joy', 'Sadness', 'Riley', 'Bo Peep', 'Violet Parr', 'Elastigirl'] },
  { category: 'Toy Story', characters: ['Woody', 'Buzz Lightyear', 'Hamm', 'Rex', 'Jessie', 'Bo Peep', 'Dolly', 'Trixie'] },
  { category: 'Cars', characters: ['Lightning McQueen', 'Mater', 'Sheriff', 'Doc Hudson', 'Sally Carrera', 'Cruz Ramirez', 'Flo'] },
  { category: 'Paddington & Peter Rabbit', characters: ['Paddington Bear', 'Peter Rabbit', 'Lily Bobtail', 'Mrs. Tiggy-Winkle'] },
  { category: 'Disney Princesses', characters: ['Elsa', 'Anna', 'Moana', 'Rapunzel', 'Belle', 'Ariel', 'Tiana', 'Mulan', 'Cinderella', 'Aurora', 'Snow White', 'Pocahontas', 'Jasmine', 'Merida'] },
  { category: 'Other Favorites', characters: ['Peppa Pig', 'George Pig', 'Dora the Explorer', 'Doc McStuffins', 'Bluey', 'Bingo', 'Minnie Mouse', 'Mickey Mouse', 'Goofy', 'Donald Duck', 'Daisy Duck', 'Hello Kitty', 'Barbie', 'Mirabel Madrigal', 'Isabela Madrigal', 'Luisa Madrigal'] },
];
const characterSelectOptions = characterOptions.map(group => ({
  label: group.category,
  options: group.characters.map(character => ({ label: character, value: character }))
}));
const lifeLessons = [
  'Empathy', 'Tolerance', 'Kindness', 'Honesty', 'Perseverance', 'Teamwork', 'Gratitude', 'Respect', 'Courage', 'Sharing',
];

// --- Animated backgrounds for steps ---
const balloonFloat = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-40px); }
`;
const BalloonsBackground = () => (
  <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
    {[...Array(7)].map((_, i) => (
      <Box
        key={i}
        position="absolute"
        left={`${10 + i * 12}%`}
        bottom="-40px"
        w="40px"
        h="60px"
        borderRadius="50% 50% 45% 45%/60% 60% 40% 40%"
        bg={`hsl(${i * 50}, 80%, 70%)`}
        animation={`${balloonFloat} 4s ease-in-out ${i * 0.5}s infinite alternate`}
        opacity={0.7}
        filter="blur(0.5px)"
      />
    ))}
  </Box>
);
const pawPrintFloat = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-30px); }
`;
const PawPrintsBackground = () => (
  <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
    {[...Array(8)].map((_, i) => (
      <Icon
        as={FaPaw}
        key={i}
        position="absolute"
        left={`${5 + i * 12}%`}
        bottom="-20px"
        w={10}
        h={10}
        color={`hsl(${i * 40}, 70%, 60%)`}
        opacity={0.5}
        animation={`${pawPrintFloat} 3.5s ease-in-out ${i * 0.4}s infinite alternate`}
      />
    ))}
  </Box>
);
const cloudFloat = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(40px); }
`;
const CloudsBackground = () => (
  <Box position="absolute" inset={0} zIndex={0} overflow="hidden">
    {[...Array(5)].map((_, i) => (
      <Box
        key={i}
        position="absolute"
        top={`${10 + i * 15}%`}
        left={`${i * 18}%`}
        w="80px"
        h="40px"
        borderRadius="50%"
        bg={`#e0e7ff`}
        opacity={0.6}
        filter="blur(2px)"
        animation={`${cloudFloat} 6s ease-in-out ${i * 0.7}s infinite alternate`}
      />
    ))}
  </Box>
);
// Setting-specific backgrounds (simple color for now, can be replaced with illustrations)
const settingBackgrounds = {
  'Arctic Adventure': '#e0f7fa',
  'Jungle Adventure': '#e8f5e9',
  'Desert Oasis': '#fffde7',
  'Enchanted Forest': '#e1f5fe',
  'Underwater Kingdom': '#e0f2f1',
  'Dinosaur World': '#f3e5f5',
  'Candy Land': '#fce4ec',
  'Pirate Ship': '#e3f2fd',
  'Haunted House': '#ede7f6',
  'Castle in the Clouds': '#f3f6fd',
  'Space Station': '#ede7f6',
  'Magical Garden': '#f1f8e9',
  'Fairy Forest': '#f8bbd0',
  'Superhero City': '#e1f5fe',
  'Arctic Wonderland': '#e0f7fa',
  'Time Travel': '#fff3e0',
  'Secret Laboratory': '#f3e5f5',
  'Other': '#fffbe7',
};

// Setting-specific theme palettes
const settingThemes: Record<string, { bg: string; cardBg: string; accent: string; button: string; input: string; text: string }> = {
  'Arctic Adventure': {
    bg: '#e0f7fa', cardBg: 'rgba(255,255,255,0.3)', accent: '#4fc3f7', button: '#4fc3f7', input: '#4fc3f7', text: '#01579b',
  },
  'Arctic Wonderland': {
    bg: '#e0f7fa', cardBg: 'rgba(255,255,255,0.3)', accent: '#00bcd4', button: '#00bcd4', input: '#00bcd4', text: '#006064',
  },
  'Jungle Adventure': {
    bg: '#e8f5e9', cardBg: 'rgba(255,255,255,0.3)', accent: '#388e3c', button: '#388e3c', input: '#388e3c', text: '#1b5e20',
  },
  'Desert Oasis': {
    bg: '#fffde7', cardBg: 'rgba(255,255,255,0.3)', accent: '#ffb300', button: '#ffb300', input: '#ffb300', text: '#bf360c',
  },
  'Enchanted Forest': {
    bg: '#e1f5fe', cardBg: 'rgba(255,255,255,0.3)', accent: '#43a047', button: '#43a047', input: '#43a047', text: '#1b5e20',
  },
  'Underwater Kingdom': {
    bg: '#b2ebf2', cardBg: 'rgba(255,255,255,0.3)', accent: '#0097a7', button: '#0097a7', input: '#0097a7', text: '#004d40',
  },
  'Castle in the Clouds': {
    bg: '#e3f2fd', cardBg: 'rgba(255,255,255,0.3)', accent: '#1976d2', button: '#1976d2', input: '#1976d2', text: '#0d47a1',
  },
  'Dinosaur World': {
    bg: '#f3e5f5', cardBg: 'rgba(255,255,255,0.3)', accent: '#8e24aa', button: '#8e24aa', input: '#8e24aa', text: '#4a148c',
  },
  'Candy Land': {
    bg: '#fce4ec', cardBg: 'rgba(255,255,255,0.3)', accent: '#e91e63', button: '#e91e63', input: '#e91e63', text: '#ad1457',
  },
  'Pirate Ship': {
    bg: '#e3f2fd', cardBg: 'rgba(255,255,255,0.3)', accent: '#795548', button: '#795548', input: '#795548', text: '#3e2723',
  },
  'Haunted House': {
    bg: '#ede7f6', cardBg: 'rgba(255,255,255,0.3)', accent: '#5e35b1', button: '#5e35b1', input: '#5e35b1', text: '#311b92',
  },
  'Fairy Forest': {
    bg: '#f8bbd0', cardBg: 'rgba(255,255,255,0.3)', accent: '#ec407a', button: '#ec407a', input: '#ec407a', text: '#880e4f',
  },
  'Superhero City': {
    bg: '#e1f5fe', cardBg: 'rgba(255,255,255,0.3)', accent: '#f44336', button: '#f44336', input: '#f44336', text: '#b71c1c',
  },
  'Time Travel': {
    bg: '#fff3e0', cardBg: 'rgba(255,255,255,0.3)', accent: '#ff7043', button: '#ff7043', input: '#ff7043', text: '#bf360c',
  },
  'Magical Garden': {
    bg: '#f1f8e9', cardBg: 'rgba(255,255,255,0.3)', accent: '#8bc34a', button: '#8bc34a', input: '#8bc34a', text: '#33691e',
  },
  'Space Station': {
    bg: '#ede7f6', cardBg: 'rgba(255,255,255,0.3)', accent: '#3949ab', button: '#3949ab', input: '#3949ab', text: '#1a237e',
  },
  'Secret Laboratory': {
    bg: '#f3e5f5', cardBg: 'rgba(255,255,255,0.3)', accent: '#00bfae', button: '#00bfae', input: '#00bfae', text: '#00695c',
  },
  'Other': {
    bg: '#fffbe7', cardBg: 'rgba(255,255,255,0.3)', accent: '#b31aff', button: '#b31aff', input: '#b31aff', text: '#3d004d',
  },
};
const defaultTheme = {
  bg: '#fffbe7',
  cardBg: 'rgba(255,255,255,0.3)',
  accent: '#b31aff',
  button: '#b31aff',
  input: '#b31aff',
  text: '#3d004d',
};

const steps = [
  { label: "Child's Name", description: "What's your name, superstar?", required: true },
  { label: "Favorite Animal", description: "Pick your favorite animal!", required: true },
  { label: "Story Setting", description: "Where should the story happen?", required: true },
  { label: "Favorite Characters", description: "Any favorite characters? (optional)", required: false },
  { label: "Life Lesson", description: "What lesson should the story teach?", required: true },
  { label: "Summary", description: "Review your choices and create your story!", required: false },
];

const StoryWizard = () => {
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState('');
  const [favoriteAnimal, setFavoriteAnimal] = useState('');
  const [customAnimal, setCustomAnimal] = useState('');
  const [setting, setSetting] = useState('');
  const [customSetting, setCustomSetting] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);
  const [lifeLesson, setLifeLesson] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Progress percentage
  const progress = ((step + 1) / steps.length) * 100;

  // Background logic
  let BgComponent: React.ReactNode = null;
  if (step === 0) BgComponent = <BalloonsBackground />;
  else if (step === 1) BgComponent = <PawPrintsBackground />;
  else if (step === 2) BgComponent = <CloudsBackground />;
  else if (step >= 2 && (setting === 'Arctic Adventure' || setting === 'Arctic Wonderland')) {
    BgComponent = <ArcticBackground />;
  } else if (step >= 2 && setting === 'Jungle Adventure') {
    BgComponent = <JungleBackground />;
  } else if (step >= 3) {
    const bgColor = settingBackgrounds[setting] || '#fffbe7';
    BgComponent = <Box position="absolute" inset={0} zIndex={0} bg={bgColor} />;
  }

  // Validation for each step
  const isStepValid = () => {
    if (step === 0) return !!childName.trim();
    if (step === 1) return !!favoriteAnimal.trim() && (favoriteAnimal !== 'Other' || !!customAnimal.trim());
    if (step === 2) return !!setting.trim() && (setting !== 'Other' || !!customSetting.trim());
    if (step === 4) return !!lifeLesson.trim();
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    setIsLoading(true);
    const finalSetting = setting === 'Other' ? customSetting : setting;
    const finalAnimal = favoriteAnimal === 'Other' ? customAnimal : favoriteAnimal;
    try {
      const storyId = await createStory({
        childName,
        favoriteAnimal: finalAnimal,
        setting: finalSetting,
        characters,
        lifeLesson,
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

  // Current theme
  const currentTheme = (settingThemes[setting] && step >= 2) ? settingThemes[setting] : defaultTheme;

  return (
    <Box minH="100vh" position="relative" bg={currentTheme.bg}>
      {BgComponent}
      <Container maxW="container.md" py={10} position="relative" zIndex={1}>
        <VStack spacing={8} align="stretch" bg={currentTheme.cardBg} borderRadius="2xl" p={8} boxShadow="2xl" backdropFilter="blur(6px)">
          <Box w="100%" h="8px" borderRadius="md" mb={2} bg={currentTheme.bg}>
            <Box h="8px" borderRadius="md" bg={currentTheme.accent} width={`${progress}%`} transition="width 0.3s" />
          </Box>
          <Heading as="h2" size="lg" color={currentTheme.accent}>{steps[step].label}</Heading>
          <Text fontSize="xl" color={currentTheme.text}>{steps[step].description}</Text>
          {/* Step 1: Child's Name */}
          {step === 0 && (
            <Input
              value={childName}
              onChange={e => setChildName(e.target.value)}
              placeholder="Enter your name, superstar!"
              size="lg"
              borderWidth="3px"
              borderColor={currentTheme.input}
              borderRadius="2xl"
              bg="whiteAlpha.900"
              fontWeight="bold"
              fontSize="2xl"
              color={currentTheme.text}
              _placeholder={{ color: currentTheme.accent, fontStyle: 'italic' }}
              _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
              sx={{ animation: `${balloonFloat} 2s ease-in-out infinite alternate` }}
            />
          )}
          {/* Step 2: Favorite Animal */}
          {step === 1 && (
            <VStack w="100%" spacing={4}>
              <ChakraSelect
                value={favoriteAnimal}
                onChange={e => setFavoriteAnimal(e.target.value)}
                placeholder="Pick an animal"
                size="lg"
                borderWidth="3px"
                borderColor={currentTheme.input}
                borderRadius="2xl"
                bg="whiteAlpha.900"
                fontWeight="bold"
                fontSize="xl"
                color={currentTheme.text}
                icon={<FaPaw />}
                _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
              >
                <option value="">None</option>
                {animalOptions.map(animal => (
                  <option key={animal} value={animal}>{animal}</option>
                ))}
              </ChakraSelect>
              {favoriteAnimal === 'Other' && (
                <Input
                  mt={2}
                  placeholder="Enter your own animal"
                  value={customAnimal}
                  onChange={e => setCustomAnimal(e.target.value)}
                  size="lg"
                  borderWidth="2px"
                  borderColor={currentTheme.input}
                  borderRadius="xl"
                  bg="whiteAlpha.900"
                  fontWeight="bold"
                  fontSize="lg"
                  color={currentTheme.text}
                  _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
                />
              )}
            </VStack>
          )}
          {/* Step 3: Story Setting */}
          {step === 2 && (
            <VStack w="100%" spacing={4}>
              <ChakraSelect
                value={setting}
                onChange={e => setSetting(e.target.value)}
                placeholder="Select a setting"
                size="lg"
                borderWidth="3px"
                borderColor={currentTheme.input}
                borderRadius="2xl"
                bg="whiteAlpha.900"
                fontWeight="bold"
                fontSize="xl"
                color={currentTheme.text}
                icon={<FaTree />}
                _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
              >
                <option value="">Select a setting</option>
                {settings.map(setting => (
                  <option key={setting} value={setting}>{setting}</option>
                ))}
              </ChakraSelect>
              {setting === 'Other' && (
                <Input
                  mt={2}
                  placeholder="Enter your own setting"
                  value={customSetting}
                  onChange={e => setCustomSetting(e.target.value)}
                  size="lg"
                  borderWidth="2px"
                  borderColor={currentTheme.input}
                  borderRadius="xl"
                  bg="whiteAlpha.900"
                  fontWeight="bold"
                  fontSize="lg"
                  color={currentTheme.text}
                  _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
                />
              )}
            </VStack>
          )}
          {/* Step 4: Favorite Characters */}
          {step === 3 && (
            <Box w="100%">
              <Select
                isMulti
                name="characters"
                options={characterSelectOptions}
                classNamePrefix="react-select"
                value={characterSelectOptions
                  .flatMap(group => group.options)
                  .filter(option => characters.includes(option.value))}
                onChange={(selected) => {
                  setCharacters(selected ? (Array.isArray(selected) ? selected.map(option => option.value) : []) : []);
                }}
                placeholder="Choose characters (optional)"
                styles={{
                  control: (base) => ({ ...base, minHeight: '48px', borderColor: currentTheme.input, boxShadow: 'none', borderRadius: 16, color: currentTheme.text }),
                  multiValue: (base) => ({ ...base, backgroundColor: currentTheme.accent + '33', color: currentTheme.text }),
                  multiValueLabel: (base) => ({ ...base, color: currentTheme.text }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? currentTheme.accent + '66' : state.isFocused ? currentTheme.accent + '22' : undefined,
                    color: currentTheme.text,
                  }),
                }}
              />
            </Box>
          )}
          {/* Step 5: Life Lesson */}
          {step === 4 && (
            <ChakraSelect
              value={lifeLesson}
              onChange={e => setLifeLesson(e.target.value)}
              placeholder="Choose a lesson"
              size="lg"
              borderWidth="3px"
              borderColor={currentTheme.input}
              borderRadius="2xl"
              bg="whiteAlpha.900"
              fontWeight="bold"
              fontSize="xl"
              color={currentTheme.text}
              icon={<FaBook />}
              _focus={{ borderColor: currentTheme.accent, boxShadow: `0 0 0 2px ${currentTheme.accent}` }}
            >
              <option value="">Choose a lesson</option>
              {lifeLessons.map((lesson) => (
                <option key={lesson} value={lesson}>{lesson}</option>
              ))}
            </ChakraSelect>
          )}
          {/* Step 6: Summary & Submit */}
          {step === 5 && (
            <Box w="100%" textAlign="left">
              <Heading as="h3" size="md" mb={4} color={currentTheme.accent}>Review your story setup:</Heading>
              <VStack align="start" spacing={2} fontSize="lg" color={currentTheme.text}>
                <Text><b>Child's Name:</b> {childName}</Text>
                <Text><b>Favorite Animal:</b> {favoriteAnimal === 'Other' ? customAnimal : favoriteAnimal}</Text>
                <Text><b>Setting:</b> {setting === 'Other' ? customSetting : setting}</Text>
                <Text><b>Characters:</b> {characters.length ? characters.join(', ') : 'None'}</Text>
                <Text><b>Life Lesson:</b> {lifeLesson}</Text>
              </VStack>
              <Button
                size="lg"
                borderRadius="full"
                px={10}
                fontWeight="bold"
                fontSize="xl"
                mt={6}
                isLoading={isLoading}
                loadingText="Creating Story..."
                onClick={handleSubmit}
                w="100%"
                bg={currentTheme.button}
                color="white"
                _hover={{ bg: currentTheme.accent }}
                _active={{ bg: currentTheme.accent }}
              >
                Create My Story!
              </Button>
            </Box>
          )}
          {/* Navigation Buttons */}
          <HStack w="100%" justify="space-between" pt={4}>
            <Button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              isDisabled={step === 0 || isLoading}
              variant="ghost"
              fontSize="lg"
              borderRadius="full"
              color={currentTheme.accent}
              bg="transparent"
              _hover={{ bg: currentTheme.accent + '22' }}
              _active={{ bg: currentTheme.accent + '33' }}
            >
              Back
            </Button>
            {step < steps.length - 1 && (
              <Button
                onClick={() => setStep(s => s + 1)}
                fontSize="lg"
                borderRadius="full"
                isDisabled={!isStepValid() || isLoading}
                bg={currentTheme.button}
                color="white"
                _hover={{ bg: currentTheme.accent }}
                _active={{ bg: currentTheme.accent }}
              >
                Next
              </Button>
            )}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
};

export default StoryWizard; 