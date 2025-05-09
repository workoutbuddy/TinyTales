import { StoryPreferences } from '../types/story';

const API_URL = '/api/openai';

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

  // --- Add mood/tone to the prompt ---
  let moodPrompt = '';
  switch (preferences.mood) {
    case 'bedtime':
      moodPrompt = 'Write the story in a calm, gentle, soothing bedtime tone. Use soft vocabulary and a peaceful pace.';
      break;
    case 'silly':
      moodPrompt = 'Write the story in a funny, wacky, and playful tone. Use silly words and lots of energy.';
      break;
    case 'bold':
      moodPrompt = 'Write the story in a bold, adventurous, and brave tone. Use exciting vocabulary and action-packed pacing.';
      break;
    case 'curious':
      moodPrompt = 'Write the story in a mysterious, thoughtful, and discovery-focused tone. Encourage curiosity and wonder.';
      break;
    default:
      moodPrompt = '';
  }

  const systemPrompt = `You are a friendly narrator for children aged 4-9. 
    IMPORTANT: Your response MUST be a valid JSON object with EXACTLY this structure:
    {
      "story": "Your story text here without any JSON or formatting characters",
      "choices": ["First specific choice", "Second specific choice"]
    }
    
    ${endingPrompt || 'Generate a short, engaging segment.'}
    The story should be set in ${preferences.setting} and feature ${preferences.childName}${preferences.favoriteAnimal ? ` and their favorite animal, ${preferences.favoriteAnimal}` : ''}.
    ${characterText} ${lessonText} 
    ${moodPrompt}
    ${!endingPrompt ? 'At the end of each segment, provide two clear, actionable choices as an array, e.g. ["Explore the cave", "Climb the tree"]. End with a question or prompt for the next action.' : ''}
    
    DO NOT include any text outside the JSON structure.
    DO NOT include the choices in the story text.
    DO NOT use markdown or special formatting.
    DO NOT nest the choices object - it must be a simple array of strings.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...previousSegments.map(text => ({ role: 'assistant', content: text })),
    ...(lastChoice ? [{ role: 'user', content: `The child chose: ${lastChoice}` }] : []),
    {
      role: 'user',
      content: isFinalSegment 
        ? 'Create a satisfying ending for the story.'
        : 'Continue the story with a new segment.'
    }
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'chat',
      model: 'gpt-4',
      messages,
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
    if (typeof content === 'string' && content.trim().startsWith('{')) {
      const parsed = JSON.parse(content);
      storyText = parsed.story || content;
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
  let safePrompt = prompt.replace(/\n/g, ' ')
    .replace(/["*#^_`~$%{}<>|\\]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 250);
  safePrompt = `Create a child-friendly illustration for a story: ${safePrompt}`;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: 'image',
      model: 'dall-e-3',
      prompt: safePrompt,
      n: 1,
      size: '1024x1024'
    })
  });
  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API Error (image):', error);
    return '';
  }
  const data = await response.json();
  return data.data[0].url;
}; 