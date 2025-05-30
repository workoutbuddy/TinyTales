import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);

  const loadStory = async () => {
    if (!storyId) return;
    try {
      const storyData = await getStory(storyId);
      setStory(storyData);
    } catch (error) {
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
    if (!storyId) return;
    setIsLoading(true);
    setIsImageLoading(true);
    try {
      await makeChoice(storyId, choiceIndex);
      await loadStory();
    } catch (error) {
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
                <Skeleton isLoaded={!isImageLoading}>
                  <Image
                    src={currentSegment.illustration}
                    alt="Story illustration"
                    borderRadius="xl"
                    onLoad={() => setIsImageLoading(false)}
                    fallback={<Box h="300px" bg="gray.100" borderRadius="xl" />}
                    transition="all 0.3s"
                    _hover={{ transform: 'scale(1.02)' }}
                  />
                </Skeleton>
                <Text
                  fontSize="xl"
                  whiteSpace="pre-wrap"
                  color="gray.700"
                  lineHeight="tall"
                  animation={`${fadeIn} 0.5s ease-out`}
                >
                  {currentSegment.text}
                </Text>
                <VStack spacing={4}>
                  {currentSegment.choices.map((choice, index) => (
                    <Button
                      key={index}
                      colorScheme="brand"
                      variant="outline"
                      w="full"
                      size="lg"
                      onClick={() => handleChoice(index)}
                      isLoading={isLoading}
                      _hover={{
                        transform: 'scale(1.02)',
                        bg: 'brand.50',
                      }}
                      transition="all 0.2s"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </Fade>
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
        </VStack>
      </Container>
    </>
  );
}; 