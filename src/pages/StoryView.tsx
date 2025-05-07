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
  Fade,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
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
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [rawModelOutputs, setRawModelOutputs] = useState<any[]>([]);

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

  useEffect(() => {
    if (!story) return;
    const currentSegment = story.segments[story.currentSegmentIndex];
    if (currentSegment.rawModelOutputs) {
      setRawModelOutputs(currentSegment.rawModelOutputs);
    }
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

  // Robustly extract story text
  let storyText = currentSegment.text;
  let choices = currentSegment.choices;

  // Use choices from rawModelOutputs if available and non-empty
  if (
    rawModelOutputs &&
    rawModelOutputs.length > 0 &&
    Array.isArray(rawModelOutputs[0].choices) &&
    rawModelOutputs[0].choices.length > 0
  ) {
    choices = rawModelOutputs[0].choices.map((c: any) =>
      typeof c === 'string' ? { text: c } : c
    );
  }

  // If storyText is a JSON string, extract the story or text field (never choices)
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(storyText);
      storyText = parsed.story || parsed.text || 'A magical story unfolds...';
    } catch {
      // If parsing fails, just use the string as-is
    }
  }

  // If no choices, show only 'The End' button
  if (!choices || choices.length === 0) {
    choices = [{ text: 'The End' }];
  }

  // Add logging for debugging choices
  console.log('UI: currentSegment.choices:', choices);
  if (Array.isArray(choices)) {
    choices.forEach((c, i) => console.log(`UI: choice[${i}]:`, c.text));
  }
  console.log('UI: rawModelOutputs:', rawModelOutputs);

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
                {/* Show raw model output for debugging */}
                {rawModelOutputs && rawModelOutputs.length > 0 && (
                  <Box bg="gray.50" borderRadius="md" p={2} mb={4} fontSize="xs" color="gray.500" maxH="120px" overflowY="auto">
                    <pre>{JSON.stringify(rawModelOutputs, null, 2)}</pre>
                  </Box>
                )}
                {/* Show loading spinner while waiting for choices */}
                {isLoading && (
                  <VStack py={8}>
                    <Text color="brand.500" fontWeight="bold">Generating options…</Text>
                    <Box className="spinner" w={8} h={8} borderWidth={2} borderRadius="full" borderColor="brand.500" borderTopColor="transparent" animation="spin 1s linear infinite" />
                  </VStack>
                )}
                {/* Show error and Try Again button if all retries fail */}
                {error && (
                  <VStack py={8}>
                    <Text color="red.500" fontWeight="bold">{error}</Text>
                    <Button colorScheme="brand" onClick={() => window.location.reload()}>Try Again</Button>
                  </VStack>
                )}
                <VStack spacing={4} align="stretch" w="100%">
                  {/* Only show choices if not loading, not error, and not last page */}
                  {!isLoading && !error && choices && choices.length > 0 && (
                    choices.length === 1 && choices[0].text === 'The End' ? (
                      <Button
                        colorScheme="brand"
                        size="lg"
                        w="100%"
                        onClick={() => setEndModalOpen(true)}
                      >
                        The End
                      </Button>
                    ) : (
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
                          {typeof choice.text === 'string' ? choice.text : 'Continue the story'}
                        </Button>
                      ))
                    )
                  )}
                </VStack>
              </VStack>
            </Box>
          </Fade>
        </VStack>
      </Container>
      <Modal isOpen={isEndModalOpen} onClose={() => {}} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Storytime Complete!</ModalHeader>
          <ModalBody>
            <Text fontSize="lg" mb={4}>
              {`Have a good night${story?.preferences.childName ? ', ' + story.preferences.childName : ''}!`}
            </Text>
            <Text fontSize="md">Would you like to go on another adventure?</Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="brand" onClick={() => navigate('/')}>Start a New Adventure</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 