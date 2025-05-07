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
    ? `Include a message that teaches the value of ${preferences.lifeLesson.toLowerCase()}.`
    : '';

  // Determine if this should be the final segment
  const isFinalSegment = previousSegments.length >= 2;  // 3rd page
  const mustEndNow = previousSegments.length >= 3;      // 4th page

  let endingPrompt = '';
  if (mustEndNow) {
    endingPrompt = 'This story must end now. Provide a final, happy ending. Do not provide any choices.';
  } else if (isFinalSegment) {
    endingPrompt = 'This is the final segment. End the story with a happy conclusion. Do not provide any choices.';
  }

  const systemPrompt = `You are a friendly narrator for children aged 4-9. 
    ${endingPrompt || 'Generate a short, engaging segment.'}
    The story should be set in ${preferences.setting} and feature ${preferences.childName} and their favorite animal, ${preferences.favoriteAnimal}. 
    ${characterText} ${lessonText} 
    ${!endingPrompt ? 'End with "What should happen next? Choose the first path or the second path."' : ''}
    Format your response as JSON with "story" and "choices" fields.`;

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
          content: `The child chose: ${lastChoice}`
        }] : []),
        {
          role: 'user',
          content: endingPrompt
            ? 'Create a satisfying ending for the story.'
            : 'Continue the story with a new segment.'
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
    let content = data.choices[0].message.content;
    // If content is a string that looks like JSON, parse it
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      storyText = parsed.story || content;
      // If this is the final segment, do not provide choices
      if (mustEndNow || isFinalSegment) {
        choices = [];
      } else {
        choices = parsed.choices || ["Continue the adventure", "Take a different path"];
      }
    } else {
      storyText = content;
      if (mustEndNow || isFinalSegment) {
        choices = [];
      } else {
        choices = ["Continue the adventure", "Take a different path"];
      }
    }
  } catch (e) {
    console.error('Error parsing story:', e);
    storyText = data.choices[0].message.content;
    if (mustEndNow || isFinalSegment) {
      choices = [];
    } else {
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