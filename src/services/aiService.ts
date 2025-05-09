import { StoryPreferences, StorySegment } from '../types/story';

const API_URL = '/api/openai';

interface GPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface DALLEResponse {
  data: Array<{
    url: string;
  }>;
}

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end. 
The story should be 2-3 paragraphs long and end with two clear choices for the reader.
Format your response as JSON with the following structure:
{
  "story": "The story text...",
  "choices": ["First choice", "Second choice"]
}`;

export const generateStorySegment = async (
  preferences: StoryPreferences,
  previousSegments: string[],
  lastChoice?: string
): Promise<{ text: string; choices: string[] }> => {
  const characterText = preferences.characters && preferences.characters.length > 0
    ? `The story should feature these characters: ${preferences.characters.join(', ')}.`
    : '';
  const prompt = `Create a story segment for a child named ${preferences.childName} who loves ${preferences.favoriteAnimal}s, set in ${preferences.setting}.
${characterText}
${previousSegments.length > 0 ? `Previous story: ${previousSegments.join(' ')}\nLast choice: ${lastChoice}` : ''}`;

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: prompt }
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'chat',
      model: 'gpt-4',
      messages,
      temperature: 0.7
    })
  });

  const data: any = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return {
    text: content.story,
    choices: content.choices
  };
};

export const generateIllustration = async (
  storySegment: string,
  preferences: StoryPreferences
): Promise<string> => {
  const prompt = `Create a child-friendly illustration for a story about ${preferences.childName} and their ${preferences.favoriteAnimal} in ${preferences.setting}. 
The scene should be: ${storySegment.substring(0, 200)}...`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'image',
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    })
  });

  const data: any = await response.json();
  return data.data[0].url;
}; 