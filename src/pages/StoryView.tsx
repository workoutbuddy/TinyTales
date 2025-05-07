import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  useToast,
  IconButton,
  HStack,
  Image,
  Skeleton,
  Fade
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { getStory, makeChoice } from '../services/storyService';
import { Story } from '../types/story';
import { generateStorySegment, generateIllustration } from '../services/openaiService';
import Background from '../components/common/Background';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const StoryView = () => {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const nextSegmentsCache = useRef<{ [key: string]: { text: string; illustration: string; choices: any[] } }>({});

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  useEffect(() => {
    // Prefetch next segments for all choices when current segment changes
    if (!story) return;
    const currentSegment = story.segments[story.currentSegmentIndex];
    currentSegment.choices.forEach(async (choice, idx) => {
      const cacheKey = `${story.currentSegmentIndex}_${idx}`;
      if (!nextSegmentsCache.current[cacheKey]) {
        try {
          const nextResult = await generateStorySegment(
            story.preferences,
            story.segments.map(s => s.text),
            choice.text
          );
          const nextIllustration = await generateIllustration(nextResult.text);
          nextSegmentsCache.current[cacheKey] = {
            text: nextResult.text,
            illustration: nextIllustration,
            choices: Array.isArray(nextResult.choices)
              ? nextResult.choices.map((c: string) => ({ text: c }))
              : [
                  { text: 'Continue the adventure' },
                  { text: 'Take a different path' }
                ]
          };
        } catch (e) {
          // Ignore prefetch errors
        }
      }
    });
  }, [story]);

  const loadStory = async () => {
    if (!storyId) return;
    try {
      const storyData = await getStory(storyId);
      setStory(storyData);
      console.log('Loaded story:', storyData);
    } catch (error) {
      console.error('Error loading story:', error);
      toast({
        title: 'Error',
        description: 'Failed to load story. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleChoice = async (choiceIndex: number) => {
    if (!storyId || !story) return;
    setIsLoading(true);
    setIsImageLoading(true);
    const cacheKey = `${story.currentSegmentIndex}_${choiceIndex}`;
    try {
      if (nextSegmentsCache.current[cacheKey]) {
        // Use cached segment
        const cached = nextSegmentsCache.current[cacheKey];
        const updatedStory = { ...story };
        updatedStory.segments = [...updatedStory.segments, cached];
        updatedStory.currentSegmentIndex = updatedStory.currentSegmentIndex + 1;
        setStory(updatedStory);
        setIsImageLoading(false);
        // Optionally, update Firestore in the background
        makeChoice(storyId, choiceIndex); // still update backend for consistency
      } else {
        // Fallback to normal flow
        await makeChoice(storyId, choiceIndex);
        await loadStory();
      }
    } catch (error) {
      console.error('Error making choice:', error);
      toast({
        title: 'Error',
        description: 'Failed to make choice. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (!story) return;
    
    const currentSegment = story.segments[story.currentSegmentIndex];
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentSegment.text);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  if (!story) {
    return (
      <Container maxW="container.md" py={10}>
        <Text>Loading story...</Text>
      </Container>
    );
  }

  const currentSegment = story.segments[story.currentSegmentIndex];
  console.log('currentSegment', currentSegment);

  // Parse story and choices if text is a JSON string
  let storyText = currentSegment.text;
  let choices = currentSegment.choices;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(storyText);
      if (parsed.story) storyText = parsed.story;
      if (parsed.choices) choices = parsed.choices.map((c: string) => ({ text: c }));
    } catch {
      // fallback: use as is
    }
  }

  return (
    <>
      <Background />
      <Container maxW="container.md" py={10}>
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading
              as="h1"
              size="xl"
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
            >
              TinyTales
            </Heading>
            <IconButton
              aria-label={isSpeaking ? 'Stop reading' : 'Read story'}
              icon={isSpeaking ? <FaVolumeMute /> : <FaVolumeUp />}
              onClick={toggleSpeech}
              colorScheme="brand"
              variant="ghost"
              size="lg"
              _hover={{ transform: 'scale(1.1)' }}
              transition="all 0.2s"
            />
          </HStack>
          <Fade in={true}>
            <Box
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
              <VStack spacing={8} align="stretch">
                <Box mb={8}>
                  {currentSegment.illustration && (
                    <Image
                      src={currentSegment.illustration}
                      alt="Story illustration"
                      borderRadius="lg"
                      boxShadow="md"
                      w="100%"
                      maxH="400px"
                      objectFit="cover"
                      mb={4}
                    />
                  )}
                </Box>
                <Text
                  fontSize="xl"
                  whiteSpace="pre-wrap"
                  color="gray.700"
                  lineHeight="tall"
                  animation={`${fadeIn} 0.5s ease-out`}
                  mb={8}
                >
                  {storyText}
                </Text>
                <VStack spacing={4} align="stretch" w="100%">
                  {choices && choices.length > 0 ? (
                    choices.map((choice, index) => (
                      <Button
                        key={index}
                        colorScheme="brand"
                        variant="outline"
                        w="100%"
                        size="lg"
                        onClick={() => handleChoice(index)}
                        isLoading={isLoading}
                        _hover={{
                          transform: 'scale(1.02)',
                          bg: 'brand.50',
                        }}
                        transition="all 0.2s"
                        whiteSpace="normal"
                        textAlign="left"
                      >
                        {choice.text}
                      </Button>
                    ))
                  ) : (
                    <Button
                      colorScheme="gray"
                      onClick={() => navigate('/')}
                      _hover={{
                        transform: 'scale(1.05)',
                        bg: 'gray.200',
                      }}
                      transition="all 0.2s"
                    >
                      Start New Story
                    </Button>
                  )}
                </VStack>
              </VStack>
            </Box>
          </Fade>
        </VStack>
      </Container>
    </>
  );
}; 