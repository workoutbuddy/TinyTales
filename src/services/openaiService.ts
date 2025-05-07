import { StoryPreferences } from '../types/story';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';

export const generateStorySegment = async (
  preferences: StoryPreferences,
  previousSegments: string[],
  lastChoice?: string
): Promise<{ text: string; choices: string[] }> => {
  const characterText = preferences.characters && preferences.characters.length > 0
    ? `The story should also feature these characters: ${preferences.characters.join(', ')}.`
    : '';
  const lessonText = preferences.lifeLesson
    ? `At the end of the story, include a message that teaches the value of ${preferences.lifeLesson.toLowerCase()}.`
    : '';
  const systemPrompt = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end. The story should be set in ${preferences.setting} and feature ${preferences.childName} and their favorite animal, ${preferences.favoriteAnimal}. ${characterText} ${lessonText} Format your response as JSON with the following structure: { "story": "The story text...", "choices": ["First choice", "Second choice"] }`;

  const response = await fetch(`${OPENAI_API_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...previousSegments.map(text => ({
          role: 'assistant',
          content: text
        })),
        ...(lastChoice ? [{
          role: 'user',
          content: `The child chose to: ${lastChoice}`
        }] : []),
        {
          role: 'user',
          content: 'Continue the story with a new segment and provide two choices at the end.'
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate story segment');
  }

  const data = await response.json();
  let storyText = '';
  let choices: string[] = [];
  try {
    const content = JSON.parse(data.choices[0].message.content);
    storyText = content.story;
    choices = content.choices;
  } catch (e) {
    // Fallback: try to extract story from a stringified JSON
    const raw = data.choices[0].message.content;
    if (raw && raw.trim().startsWith('{')) {
      try {
        const content = JSON.parse(raw);
        storyText = content.story || raw;
        choices = content.choices || ["Continue the adventure", "Take a different path"];
      } catch {
        storyText = raw;
        choices = ["Continue the adventure", "Take a different path"];
      }
    } else {
      storyText = raw || 'Once upon a time...';
      choices = ["Continue the adventure", "Take a different path"];
    }
  }
  return { text: storyText, choices };
};

export const generateIllustration = async (prompt: string): Promise<string> => {
  const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `Create a child-friendly illustration for a story: ${prompt}`,
      n: 1,
      size: '1024x1024'
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate illustration');
  }

  const data = await response.json();
  return data.data[0].url;
}; 