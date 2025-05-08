import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardFooter,
  useToast,
  Spinner,
  Center,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getUserStories, createStory, deleteStory } from '../services/storyService';
import { Story } from '../types/story';
import Background from '../components/common/Background';
import { useMood } from '../theme/MoodContext';

export const Home = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingStoryId, setDeletingStoryId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { theme } = useMood();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const userStories = await getUserStories();
        setStories(userStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your stories. Please try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [toast]);

  const handleExploreOtherPath = async (preferences: Story["preferences"]) => {
    try {
      const newStoryId = await createStory(preferences);
      navigate(`/story/${newStoryId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start a new adventure. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingStoryId) return;
    try {
      await deleteStory(deletingStoryId);
      setStories(stories => stories.filter(s => s.id !== deletingStoryId));
      toast({
        title: 'Story deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete story. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteDialogOpen(false);
      setDeletingStoryId(null);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  return (
    <>
      <Background />
      <Box minH="100vh" bgGradient={theme.bgGradient} fontFamily={theme.font} color={theme.text}>
        <Container maxW="container.xl" py={{ base: 4, md: 10 }} px={{ base: 2, md: 0 }}>
          <VStack spacing={{ base: 4, md: 8 }} align="stretch">
            <Box textAlign="center">
              <Heading
                as="h1"
                size={{ base: 'lg', md: '2xl' }}
                bgGradient={theme.bgGradient}
                bgClip="text"
                fontFamily={theme.font}
                color={theme.accent}
              >
                {theme.icon} Your Stories
              </Heading>
              <Text fontSize={{ base: 'sm', md: 'lg' }} color={theme.text}>
                Create new stories or continue your adventures
              </Text>
            </Box>
            <Button
              colorScheme={undefined}
              size="lg"
              px={{ base: 4, md: 8 }}
              fontSize={{ base: 'md', md: 'lg' }}
              alignSelf="center"
              bg={theme.button.bg}
              color={theme.button.color}
              _hover={{ bg: theme.accent, transform: 'scale(1.05)' }}
              fontFamily={theme.font}
              onClick={() => navigate('/story/new')}
            >
              {theme.icon} Create New Story
            </Button>
            {stories.length === 0 ? (
              <Box textAlign="center" py={10}>
                <Text fontSize="xl" color={theme.text}>
                  You haven't created any stories yet. Start your first adventure!
                </Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {stories.map((story) => (
                  <Card
                    key={story.id}
                    p={{ base: 4, md: 6 }}
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="md"
                    bg={theme.cardBg}
                    _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                    transition="all 0.2s"
                  >
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <Heading size={{ base: 'sm', md: 'md' }} color={theme.accent} fontFamily={theme.font}>{story.preferences.setting}</Heading>
                        <Text fontSize={{ base: 'sm', md: 'md' }} color={theme.text}>Created for: {story.preferences.childName}</Text>
                        <Text fontSize={{ base: 'sm', md: 'md' }} color={theme.text}>Characters: {story.preferences.characters.join(', ')}</Text>
                      </VStack>
                    </CardBody>
                    <CardFooter>
                      <VStack w="full" spacing={2}>
                        {story.status === 'ended' ? (
                          <Button
                            colorScheme={undefined}
                            variant="outline"
                            w="full"
                            fontSize={{ base: 'sm', md: 'md' }}
                            bg={theme.button.bg}
                            color={theme.button.color}
                            borderColor={theme.accent}
                            _hover={{ bg: theme.accent, color: theme.text }}
                            onClick={() => handleExploreOtherPath(story.preferences)}
                          >
                            Explore Other Path
                          </Button>
                        ) : (
                          <Button
                            colorScheme={undefined}
                            variant="outline"
                            w="full"
                            fontSize={{ base: 'sm', md: 'md' }}
                            bg={theme.button.bg}
                            color={theme.button.color}
                            borderColor={theme.accent}
                            _hover={{ bg: theme.accent, color: theme.text }}
                            onClick={() => navigate(`/story/${story.id}`)}
                          >
                            Continue Story
                          </Button>
                        )}
                        <Button
                          colorScheme={undefined}
                          variant="outline"
                          w="full"
                          fontSize={{ base: 'sm', md: 'md' }}
                          bg={theme.button.bg}
                          color={theme.button.color}
                          borderColor={theme.accent}
                          _hover={{ bg: theme.accent, color: theme.text }}
                          onClick={() => { setDeletingStoryId(story.id); setDeleteDialogOpen(true); }}
                        >
                          Delete
                        </Button>
                      </VStack>
                    </CardFooter>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Container>
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay />
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Story
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Box>
    </>
  );
}; 