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
import { useMood } from '../theme/MoodContext';
import StoryWizard from '../components/StoryWizard';

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
  const { theme } = useMood();
  return (
    <>
      <Background />
      <Box minH="100vh" bgGradient={theme.bgGradient} fontFamily={theme.font} color={theme.text}>
        <Container maxW="container.md" py={10}>
          <StoryWizard />
        </Container>
      </Box>
    </>
  );
}; 