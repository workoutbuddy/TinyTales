import type { StoryChoice } from '../../types/story';

export const generateStorySegment = async (preferences: any, previousSegments: string[], lastChoice?: string) => {
  // Generate context-aware story text
  const storyText = `One sunny day in ${preferences.setting}, ${preferences.childName} and their ${preferences.favoriteAnimal} were exploring the magical realm. 
    As they wandered through the enchanted landscape, they encountered something that would teach them about ${preferences.lifeLesson}. 
    The sun had started to set, casting a warm glow over the ${preferences.setting.toLowerCase()}.`;

  // Generate context-aware choices based on preferences
  const choices: StoryChoice[] = [];
  
  if (preferences.setting.toLowerCase().includes('castle')) {
    choices.push(
      { text: 'Enter the grand castle to meet the royal family' },
      { text: 'Explore the castle gardens to find the secret passage' }
    );
  } else if (preferences.setting.toLowerCase().includes('forest')) {
    choices.push(
      { text: 'Enter the mysterious forest to find the ancient tree' },
      { text: 'Follow the sparkling path to the magical clearing' }
    );
  } else if (preferences.setting.toLowerCase().includes('ocean') || preferences.setting.toLowerCase().includes('sea')) {
    choices.push(
      { text: 'Dive into the crystal-clear water to explore the underwater world' },
      { text: 'Follow the river to discover the hidden waterfall' }
    );
  } else if (preferences.characters.some(c => c.toLowerCase().includes('dragon'))) {
    choices.push(
      { text: 'Approach the friendly dragon to learn its secret' },
      { text: 'Hide behind the rocks to observe the dragon first' }
    );
  } else {
    choices.push(
      { text: 'Touch the glowing crystal to activate its magic' },
      { text: 'Search for the ancient spellbook in the library' }
    );
  }

  return {
    text: storyText,
    choices
  };
};

export const generateIllustration = async (text: string) => {
  // Return a test illustration URL
  return 'https://test-image-url.com/test.jpg';
}; 