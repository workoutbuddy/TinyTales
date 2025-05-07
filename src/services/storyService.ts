import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Story, StoryPreferences, StorySegment, StoryChoice } from '../types/story';
import { generateStorySegment, generateIllustration } from './openaiService';

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end.

IMPORTANT RULES:
1. Each story segment should be 2-3 paragraphs long.
2. Choices MUST be specific to the story context and NEVER generic.
3. Choices should be actionable and lead to different story paths.
4. Return choices as a JSON array of strings.

BAD CHOICES (NEVER USE THESE):
- "Continue the adventure"
- "Take a different path"
- "Do something brave"
- "Do something silly"
- "Explore more"
- "Go back"

GOOD CHOICES (EXAMPLES):
Story: "The little dragon found a mysterious cave..."
Good choices: ["Enter the dark cave to find the treasure", "Wait outside for your dragon friends"]

Story: "The robot's battery was running low..."
Good choices: ["Search for a charging station in the city", "Ask the friendly shopkeeper for help"]

Story: "The magic tree started to glow..."
Good choices: ["Touch the glowing leaves to see what happens", "Call your forest friends to investigate"]

Format your response as:
{
  "story": "Your story text here...",
  "choices": ["First specific choice", "Second specific choice"]
}`;

const SHOW_ILLUSTRATIONS = true; // Set to true to enable picture generation

// List of generic choices to filter out
const GENERIC_CHOICES = [
  'continue', 'adventure', 'path', 'brave', 'silly', 'explore', 'back',
  'next', 'different', 'something', 'more', 'try', 'again', 'go', 'do',
  'make', 'take', 'follow', 'choose', 'pick', 'select', 'decide'
];

// List of action verbs that make choices more specific
const GOOD_ACTION_VERBS = [
  'enter', 'search', 'find', 'discover', 'explore', 'visit', 'climb',
  'swim', 'fly', 'run', 'walk', 'jump', 'hide', 'seek', 'build',
  'create', 'solve', 'help', 'rescue', 'protect', 'learn', 'teach',
  'share', 'gather', 'collect', 'open', 'close', 'push', 'pull',
  'lift', 'carry', 'bring', 'take', 'give', 'show', 'tell', 'ask'
];

// List of descriptive words that make choices more engaging
const GOOD_DESCRIPTIVE_WORDS = [
  'magical', 'mysterious', 'hidden', 'secret', 'ancient', 'enchanted',
  'sparkling', 'glowing', 'shimmering', 'twinkling', 'glittering',
  'colorful', 'bright', 'dark', 'deep', 'high', 'low', 'far', 'near',
  'big', 'small', 'tiny', 'huge', 'giant', 'miniature', 'beautiful',
  'wonderful', 'amazing', 'incredible', 'fantastic', 'fabulous'
];

// Function to check if a choice is too generic
function isGenericChoice(choice: string): boolean {
  const lowerChoice = choice.toLowerCase();
  // Check for generic words
  if (GENERIC_CHOICES.some(generic => lowerChoice.includes(generic))) {
    return true;
  }
  // Check for question marks (choices should be statements, not questions)
  if (choice.includes('?')) {
    return true;
  }
  // Check for too many conjunctions (complex choices are harder to understand)
  const conjunctionCount = (choice.match(/and|or|but|because|if|when|while/g) || []).length;
  if (conjunctionCount > 1) {
    return true;
  }
  // Only filter out if empty or very short
  if (choice.length < 8) {
    return true;
  }
  return false;
}

// Function to validate and clean choices
function validateChoices(choices: any[]): StoryChoice[] {
  if (!Array.isArray(choices)) return [];
  
  // Map to string for easier filtering
  const mappedChoices = choices.map(c => {
    if (!c) return '';
    if (typeof c === 'string') return c.trim();
    if (typeof c.text === 'string') return c.text.trim();
    if (c.text && typeof c.text.text === 'string') return c.text.text.trim();
    return '';
  }).filter(Boolean); // Remove empty strings

  // If we have more than 2 choices, try to find the best two
  if (mappedChoices.length > 2) {
    // Score each choice based on quality
    const scoredChoices = mappedChoices.map(choice => {
      let score = 0;
      // Longer choices are better (but not too long)
      if (choice.length > 15 && choice.length < 100) score += 2;
      // Contains action verbs
      if (GOOD_ACTION_VERBS.some(verb => choice.toLowerCase().includes(verb))) score += 1;
      // Contains descriptive words
      if (GOOD_DESCRIPTIVE_WORDS.some(word => choice.toLowerCase().includes(word))) score += 1;
      // No generic words
      if (!GENERIC_CHOICES.some(generic => choice.toLowerCase().includes(generic))) score += 2;
      // No question marks
      if (!choice.includes('?')) score += 1;
      // No excessive conjunctions
      const conjunctionCount = (choice.match(/and|or|but|because|if|when|while/g) || []).length;
      if (conjunctionCount <= 1) score += 1;
      
      return { choice, score };
    });

    // Sort by score and take top 2
    const bestChoices = scoredChoices
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map(scored => scored.choice);

    // If we have two good choices, use them
    if (bestChoices.length === 2 && bestChoices.every(c => !isGenericChoice(c))) {
      return bestChoices.map(choice => ({ text: choice }));
    }
  }

  // Filter out generic/empty/very short choices
  const validChoices = mappedChoices
    .filter(choice => choice && !isGenericChoice(choice))
    .map(choice => ({ text: choice }));

  // If we don't have exactly 2 valid choices, return [] so fallback/ending logic can take over
  if (validChoices.length !== 2) {
    return [];
  }

  return validChoices;
}

function safeJsonParse(str: string) {
  try {
    // Remove control characters except for newlines and tabs
    const sanitized = str.replace(/[\u0000-\u0019]+/g, ' ');
    return JSON.parse(sanitized);
  } catch {
    return null;
  }
}

function extractChoicesFromText(text: string): string[] {
  // Try to extract choices: ["Choice 1", "Choice 2"] from the text
  const match = text.match(/choices\s*:\s*\[(.*?)\]/is);
  if (match && match[1]) {
    // Split by quotes and commas, filter out empty
    const raw = match[1];
    const choices = raw.match(/"(.*?)"/g);
    if (choices && choices.length === 2) {
      return choices.map(c => c.replace(/"/g, '').trim());
    }
  }
  // Try to extract numbered choices (e.g., 1. ... 2. ...), robust to quotes, asterisks, whitespace
  // Look for lines like: 1. "..." or 1. ...
  const numbered = text.match(/\n\s*1\.?\s*["*]?(.*?)["*]?\s*\n\s*2\.?\s*["*]?(.*?)["*]?(\n|$)/s);
  if (numbered && numbered[1] && numbered[2]) {
    return [numbered[1].trim(), numbered[2].trim()];
  }
  // Try to extract any two consecutive lines at the end that look like choices
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  // Look for last two non-empty lines that are not generic
  for (let i = lines.length - 2; i >= 0; i--) {
    const c1 = lines[i];
    const c2 = lines[i + 1];
    if (
      c1.length > 10 && c2.length > 10 &&
      !isGenericChoice(c1) && !isGenericChoice(c2)
    ) {
      return [c1, c2];
    }
  }
  return [];
}

// Function to check if a story segment is an ending
function isEnding(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    lower.includes('the end') ||
    lower.includes('always be friends') ||
    lower.includes('cherished memories') ||
    lower.includes('happily ever after') ||
    lower.includes('grateful for the wonderful adventures') ||
    lower.includes('story came to a peaceful and satisfying end') ||
    !!lower.match(/(as the day (came|drew) to an end|finally reached .+ waterfall|knew that they would always be friends)/)
  );
}

function extractStoryAndChoices(segment: any) {
  let storyText = segment.text;
  let choices = segment.choices;
  let contextQuestion = '';

  // If the text is a JSON string, try to parse it with better error handling
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    try {
      // First attempt: Direct parse
      const parsed = safeJsonParse(storyText);
      if (parsed && parsed.story) {
        storyText = parsed.story;
        if (Array.isArray(parsed.choices)) {
          choices = parsed.choices;
        }
      }
    } catch (error) {
      console.error('Failed to parse story JSON:', error);
      // Second attempt: Clean the string and try again
      try {
        const cleanedText = storyText
          .replace(/[\u0000-\u0019]+/g, ' ') // Remove control chars
          .replace(/\n\s*\n/g, '\n') // Remove extra newlines
          .trim();
        const parsed = JSON.parse(cleanedText);
        if (parsed && parsed.story) {
          storyText = parsed.story;
          if (Array.isArray(parsed.choices)) {
            choices = parsed.choices;
          }
        }
      } catch (secondError) {
        console.error('Failed second JSON parse attempt:', secondError);
        // If both attempts fail, use the original text
        storyText = storyText.replace(/[\u0000-\u0019]+/g, ' ').trim();
      }
    }
  }

  // Clean up story text and extract choices if they're embedded
  if (typeof storyText === 'string') {
    // Remove any embedded choices from the story text
    storyText = storyText
      .replace(/What should they do next\?.*$/s, '') // Remove "What should they do next?" and everything after
      .replace(/\[.*?\]/g, '') // Remove any remaining choice arrays
      .replace(/\n\s*\n/g, '\n') // Remove extra newlines
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // If choices are not valid, try to extract them from the original text
    if (!Array.isArray(choices) || choices.length !== 2) {
      const extracted = extractChoicesFromText(segment.text);
      if (extracted.length === 2) {
        choices = extracted;
      }
    }
  }

  // Ensure choices is an array of objects with text property
  if (Array.isArray(choices)) {
    choices = choices.map(choice => {
      if (typeof choice === 'string') {
        return { text: choice.trim() };
      } else if (typeof choice === 'object' && choice !== null) {
        return { text: (choice.text || choice.toString()).trim() };
      }
      return null;
    }).filter(Boolean); // Remove any null entries
  } else {
    choices = [];
  }

  // If no valid choices were found, check for ending
  if (choices.length !== 2) {
    if (isEnding(storyText)) {
      choices = [];
    } else {
      // Use context-aware fallback choices
      const fallbackChoices = generateFallbackChoices(storyText, 0);
      choices = fallbackChoices;
    }
  }

  return { text: storyText, choices, contextQuestion };
}

// Function to generate context-aware fallback choices
function generateFallbackChoices(storyContext: string, pageIndex: number): StoryChoice[] {
  const context = storyContext.toLowerCase();
  
  // Extract themes from context
  const hasCastle = context.includes('castle') || context.includes('palace') || context.includes('tower');
  const hasForest = context.includes('forest') || context.includes('tree') || context.includes('wood');
  const hasWater = context.includes('water') || context.includes('river') || context.includes('lake') || context.includes('ocean');
  const hasDragon = context.includes('dragon') || context.includes('monster') || context.includes('creature');
  const hasMagic = context.includes('magic') || context.includes('spell') || context.includes('enchanted');
  
  if (pageIndex === 0) {
    // First page choices
    if (hasCastle) {
      return [
        { text: 'Enter the grand castle to meet the royal family' },
        { text: 'Explore the castle gardens to find the secret passage' }
      ];
    } else if (hasForest) {
      return [
        { text: 'Enter the mysterious forest to find the ancient tree' },
        { text: 'Follow the sparkling path to the magical clearing' }
      ];
    } else if (hasWater) {
      return [
        { text: 'Dive into the crystal-clear water to explore the underwater world' },
        { text: 'Follow the river to discover the hidden waterfall' }
      ];
    } else if (hasDragon) {
      return [
        { text: 'Approach the friendly dragon to learn its secret' },
        { text: 'Hide behind the rocks to observe the dragon first' }
      ];
    } else if (hasMagic) {
      return [
        { text: 'Touch the glowing crystal to activate its magic' },
        { text: 'Search for the ancient spellbook in the library' }
      ];
    } else {
      return [
        { text: 'Enter the magical world to begin your adventure' },
        { text: 'Follow the sparkling path to meet your new friends' }
      ];
    }
  } else if (pageIndex === 1) {
    // Second page choices
    if (hasDragon) {
      return [
        { text: 'Approach the friendly dragon to learn its secret' },
        { text: 'Hide behind the rocks to observe the dragon first' }
      ];
    } else if (hasMagic) {
      return [
        { text: 'Touch the glowing crystal to activate its magic' },
        { text: 'Search for the ancient spellbook in the library' }
      ];
    } else if (hasCastle) {
      return [
        { text: 'Explore the castle tower to find the royal treasure' },
        { text: 'Visit the castle kitchen to help prepare a feast' }
      ];
    } else {
      return [
        { text: 'Follow the magical trail to the enchanted garden' },
        { text: 'Enter the mysterious cave to find the hidden treasure' }
      ];
    }
  }
  
  return [
    { text: 'Continue your magical adventure' },
    { text: 'Discover new wonders in this enchanted world' }
  ];
}

async function generateStorySegmentWithRetries(
  preferences: StoryPreferences,
  previousSegments: string[],
  lastChoice: string | undefined,
  pageIndex: number,
  maxRetries: number = 5
): Promise<{
  text: string;
  choices: StoryChoice[];
  rawModelOutputs: Array<{ text: string; choices: any[] }>;
  isFallback?: boolean;
}> {
  let attempt = 0;
  let result;
  let rawModelOutputs: Array<{ text: string; choices: any[] }> = [];
  let lastError = null;

  while (attempt < maxRetries) {
    try {
      result = await generateStorySegment(preferences, previousSegments, lastChoice);
      console.log(`[RETRY ${attempt + 1}] Raw model response:`, result);
      rawModelOutputs.push(result);

      // Extract and validate choices
      const extracted = extractStoryAndChoices(result);
      const validChoices = validateChoices(extracted.choices);

      // Log the validation results
      console.log(`[RETRY ${attempt + 1}] Extracted choices:`, extracted.choices);
      console.log(`[RETRY ${attempt + 1}] Valid choices:`, validChoices);

      if (validChoices.length === 2) {
        console.log(`[RETRY ${attempt + 1}] Valid choices found:`, validChoices);
        return { 
          text: extracted.text,
          choices: validChoices,
          rawModelOutputs 
        };
      }

      console.log(`[RETRY ${attempt + 1}] Invalid choices:`, extracted.choices);
      console.log(`[RETRY ${attempt + 1}] Reason: ${validChoices.length !== 2 ? 'Wrong number of choices' : 'Generic choices detected'}`);
      
      attempt++;
    } catch (error) {
      lastError = error;
      console.error(`[RETRY ${attempt + 1}] Error:`, error);
      attempt++;
    }
  }

  // Fallbacks only if all retries fail
  console.log(`[FALLBACK] All retries failed. Page index: ${pageIndex}. Last error:`, lastError);
  
  // Return a fallback with "Continue Adventure" options
  return { 
    text: result?.text || 'A magical story unfolds...',
    choices: [
      { text: 'Continue the adventure' },
      { text: 'Take a different path' }
    ],
    rawModelOutputs,
    isFallback: true
  };
}

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  console.log('[createStory] called with preferences:', preferences);
  try {
    console.log('[createStory] generating story segment...');
    const initial = await generateStorySegmentWithRetries(preferences, [], undefined, 0);
    console.log('[createStory] story segment generated:', initial);
    console.log('[createStory] rawModelOutputs:', initial.rawModelOutputs);

    let illustration = '';
    if (SHOW_ILLUSTRATIONS) {
      console.log('[createStory] generating illustration...');
      illustration = await generateIllustration(initial.text);
      console.log('[createStory] illustration generated:', illustration);
    }

    const extracted = extractStoryAndChoices(initial);
    console.log('[createStory] extracted choices:', extracted.choices);
    const initialSegment: StorySegment = {
      text: extracted.text || '',
      illustration: illustration || '',
      choices: Array.isArray(extracted.choices)
        ? extracted.choices.map((c: string) => ({ text: c }))
        : [],
      rawModelOutputs: initial.rawModelOutputs || []
    };
    console.log('[createStory] initialSegment:', initialSegment);

    const now = new Date();
    const story: Omit<Story, 'id'> = {
      preferences,
      segments: [initialSegment],
      currentSegmentIndex: 0,
      createdAt: {
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: (now.getTime() % 1000) * 1000000
      }
    };

    console.log('[createStory] adding story to Firestore...');
    const docRef = await addDoc(collection(db, 'stories'), story);
    console.log('[createStory] story added to Firestore with id:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('[createStory] error:', error);
    throw error;
  }
};

export const getStory = async (storyId: string): Promise<Story | null> => {
  const docRef = doc(db, 'stories', storyId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return {
    id: docSnap.id,
    ...docSnap.data()
  } as Story;
};

export const makeChoice = async (
  storyId: string,
  choiceIndex: number
): Promise<void> => {
  const story = await getStory(storyId);
  if (!story) throw new Error('Story not found');

  const currentSegment = story.segments[story.currentSegmentIndex];
  const choice = currentSegment.choices[choiceIndex];

  const next = await generateStorySegmentWithRetries(
    story.preferences,
    story.segments.map(s => s.text),
    choice.text,
    story.currentSegmentIndex + 1
  );
  console.log('[makeChoice] rawModelOutputs:', next.rawModelOutputs);

  let illustration = '';
  if (SHOW_ILLUSTRATIONS) {
    illustration = await generateIllustration(next.text);
  }

  const extracted = extractStoryAndChoices(next);
  console.log('[makeChoice] extracted choices:', extracted.choices);
  let storyText = extracted.text;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    storyText = 'A magical story unfolds...';
  }
  const nextSegment: StorySegment = {
    text: storyText || '',
    illustration: illustration || '',
    choices: Array.isArray(extracted.choices)
      ? extracted.choices.map((c: string) => ({ text: c }))
      : [],
    rawModelOutputs: next.rawModelOutputs || []
  };
  console.log('[makeChoice] nextSegment:', nextSegment);

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
}; 