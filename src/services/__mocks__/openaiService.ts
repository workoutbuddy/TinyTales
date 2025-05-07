export const generateStorySegment = async (preferences: any, previousSegments: string[], lastChoice?: string) => {
  // Return a test story segment with specific choices
  const storyText = `Once upon a time in ${preferences.setting}, there lived a young ${preferences.childName} who loved adventures with their ${preferences.favoriteAnimal}. 
    One day, while exploring the magical realm, they discovered something extraordinary that would teach them about ${preferences.lifeLesson}.`;

  return {
    text: storyText,
    choices: [
      { text: 'Enter the mysterious cave to find the dragon\'s treasure' },
      { text: 'Follow the sparkling path to the enchanted garden' }
    ]
  };
};

export const generateIllustration = async (text: string) => {
  // Return a test illustration URL
  return 'https://test-image-url.com/test.jpg';
}; 