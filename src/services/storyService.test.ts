// Mock the Firebase and OpenAI services
jest.mock('./firebase');
jest.mock('./openaiService');

import type { StoryPreferences, StoryChoice } from '../types/story';
const { createStory, makeChoice, getStory } = require('./storyService');

// Test preferences
const testPreferences: StoryPreferences = {
  childName: 'TestChild',
  age: 7,
  interests: ['dragons', 'magic', 'adventure'],
  theme: 'fantasy'
};

// Test generic choices that should be rejected
const genericChoices = [
  'Continue the adventure',
  'Do something brave',
  'Take a different path',
  'Go back',
  'Try again',
  'Explore more'
];

// Test specific choices that should be accepted
const specificChoices = [
  'Enter the mysterious cave to find the dragon\'s treasure',
  'Follow the sparkling path to the enchanted garden',
  'Search for the ancient spellbook in the library',
  'Approach the friendly dragon to learn its secret'
];

describe('Story Service Tests', () => {
  test('should create a story with valid choices', async () => {
    // Create a new story
    const storyId = await createStory(testPreferences);
    expect(storyId).toBeDefined();
    
    // Get the story and verify initial choices
    const story = await getStory(storyId);
    expect(story).toBeDefined();
    
    const initialChoices = story!.segments[0].choices;
    expect(initialChoices).toHaveLength(2);
    
    // Verify choice quality
    initialChoices.forEach((choice: StoryChoice) => {
      expect(choice.text.length).toBeGreaterThanOrEqual(15);
      expect(choice.text).not.toContain('?');
      
      // Check for generic words
      genericChoices.forEach(genericChoice => {
        expect(choice.text.toLowerCase()).not.toContain(genericChoice.toLowerCase());
      });
    });
    
    // Make a choice and verify next segment
    await makeChoice(storyId, 0);
    
    const updatedStory = await getStory(storyId);
    expect(updatedStory).toBeDefined();
    
    const nextChoices = updatedStory!.segments[1].choices;
    expect(nextChoices).toHaveLength(2);
    
    // Verify choice quality
    nextChoices.forEach((choice: StoryChoice) => {
      expect(choice.text.length).toBeGreaterThanOrEqual(15);
      expect(choice.text).not.toContain('?');
      
      // Check for generic words
      genericChoices.forEach(genericChoice => {
        expect(choice.text.toLowerCase()).not.toContain(genericChoice.toLowerCase());
      });
    });
    
    // Verify raw model outputs
    const rawOutputs = updatedStory!.segments[1].rawModelOutputs;
    expect(rawOutputs).toBeDefined();
    expect(rawOutputs!.length).toBeGreaterThan(0);
  });
}); 