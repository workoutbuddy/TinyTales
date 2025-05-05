import { StoryPreferences, StorySegment } from '../types/story';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

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
  const prompt = `Create a story segment for a child named ${preferences.childName} who loves ${preferences.favoriteAnimal}s, set in ${preferences.setting}.
${previousSegments.length > 0 ? `Previous story: ${previousSegments.join(' ')}\nLast choice: ${lastChoice}` : ''}`;

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  const data: GPTResponse = await response.json();
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

  const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid'
    })
  });

  const data: DALLEResponse = await response.json();
  return data.data[0].url;
}; 