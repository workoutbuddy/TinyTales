import React, { useEffect, useState } from 'react';
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
  Center
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { getUserStories, createStory } from '../services/storyService';
import { Story } from '../types/story';
import Background from '../components/common/Background';

export const Home = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Container maxW="container.xl" py={{ base: 4, md: 10 }} px={{ base: 2, md: 0 }}>
        <VStack spacing={{ base: 4, md: 8 }} align="stretch">
          <Box textAlign="center">
            <Heading
              as="h1"
              size={{ base: 'lg', md: '2xl' }}
              bgGradient="linear(to-r, brand.400, brand.600)"
              bgClip="text"
            >
              Your Stories
            </Heading>
            <Text fontSize={{ base: 'sm', md: 'lg' }} color="gray.600">
              Create new stories or continue your adventures
            </Text>
          </Box>

            <Button
              colorScheme="brand"
              size="lg"
              px={{ base: 4, md: 8 }}
              fontSize={{ base: 'md', md: 'lg' }}
              alignSelf="center"
              onClick={() => navigate('/story/new')}
            >
              Create New Story
            </Button>

          {stories.length === 0 ? (
            <Box textAlign="center" py={10}>
              <Text fontSize="xl" color="gray.500">
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
                  _hover={{ transform: 'translateY(-4px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <VStack align="start" spacing={3}>
                      <Heading size={{ base: 'sm', md: 'md' }}>{story.preferences.setting}</Heading>
                      <Text fontSize={{ base: 'sm', md: 'md' }}>Created for: {story.preferences.childName}</Text>
                      <Text fontSize={{ base: 'sm', md: 'md' }}>Characters: {story.preferences.characters.join(', ')}</Text>
                    </VStack>
                  </CardBody>
                  <CardFooter>
                    {story.status === 'ended' && (
                      <Text color="purple.500" fontWeight="bold" mb={2} fontSize={{ base: 'sm', md: 'md' }}>
                        {story.ending ? story.ending : 'The End'}
                      </Text>
                    )}
                    {story.status === 'ended' ? (
                      <Button
                        colorScheme="purple"
                        variant="outline"
                        w="full"
                        fontSize={{ base: 'sm', md: 'md' }}
                        onClick={() => handleExploreOtherPath(story.preferences)}
                      >
                        Explore Other Path
                      </Button>
                    ) : (
                      <Button
                        colorScheme="brand"
                        variant="outline"
                        w="full"
                        fontSize={{ base: 'sm', md: 'md' }}
                        onClick={() => navigate(`/story/${story.id}`)}
                      >
                        Continue Story
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </>
  );
}; 