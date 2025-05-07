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

const SHOW_ILLUSTRATIONS = false; // Set to true to enable picture generation

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

  // Check length constraints
  if (choice.length < 15 || choice.length > 100) {
    return true;
  }

  // Check for action verbs
  const hasActionVerb = GOOD_ACTION_VERBS.some(verb => lowerChoice.includes(verb));
  if (!hasActionVerb) {
    return true;
  }

  // Check for descriptive words
  const hasDescriptiveWord = GOOD_DESCRIPTIVE_WORDS.some(word => lowerChoice.includes(word));
  if (!hasDescriptiveWord) {
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

  return false;
}

// Function to validate and clean choices
function validateChoices(choices: any[]): { text: string }[] {
  if (!Array.isArray(choices)) return [];
  
  return choices
    .filter(c => {
      if (!c || typeof c !== 'string') return false;
      
      const choice = c.trim();
      
      // Basic validation
      if (isGenericChoice(choice)) return false;
      
      // Check for balanced choices (similar length and complexity)
      if (choices.length === 2) {
        const otherChoice = choices.find(oc => oc !== c);
        if (otherChoice) {
          const lengthDiff = Math.abs(choice.length - otherChoice.length);
          if (lengthDiff > 30) return false; // Too different in length
        }
      }
      
      return true;
    })
    .map(c => ({ text: c.trim() }));
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

function extractStoryAndChoices(segment: any) {
  let storyText = segment.text;
  let choices = segment.choices;
  let contextQuestion = '';
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    const parsed = safeJsonParse(storyText);
    if (parsed && parsed.story) {
      storyText = parsed.story;
      if (Array.isArray(parsed.choices)) {
        choices = parsed.choices;
      } else if (typeof parsed.choices === 'string') {
        // Try to extract two options from the string
        // e.g. "What should happen next? Choose the first path to the waterfall or the second path to the forest?"
        const match = parsed.choices.match(/first path(?: to|:)? ([^.,;!?]+)[.,;!?]? or the second path(?: to|:)? ([^.,;!?]+)[.,;!?]?/i);
        if (match) {
          choices = [match[1].trim(), match[2].trim()];
        } else {
          // Try to split on ' or '
          const split = parsed.choices.split(/ or /i);
          if (split.length === 2) {
            choices = [split[0].replace(/.*choose /i, '').trim(), split[1].replace(/\?$/, '').trim()];
          } else {
            contextQuestion = parsed.choices;
            choices = ["Do something brave", "Do something silly"];
          }
        }
      } else {
        choices = ["Do something brave", "Do something silly"];
      }
    } else {
      // Use the raw text as fallback, not just a generic message
      storyText = typeof segment.text === 'string' ? segment.text : 'A magical story unfolds...';
      choices = ["Do something brave", "Do something silly"];
    }
  }
  // Always return choices as array of objects for UI safety
  if (!Array.isArray(choices) || choices.length === 0) {
    choices = ["Do something brave", "Do something silly"];
  }
  choices = choices.map((c: any) => typeof c === 'string' ? { text: c } : c);
  return { text: storyText, choices, contextQuestion };
}

// Function to generate context-aware fallback choices
function generateFallbackChoices(storyContext: string, pageIndex: number): { text: string }[] {
  const context = storyContext.toLowerCase();
  
  // Extract themes from context
  const hasForest = context.includes('forest') || context.includes('tree') || context.includes('wood');
  const hasWater = context.includes('water') || context.includes('river') || context.includes('lake') || context.includes('ocean');
  const hasCastle = context.includes('castle') || context.includes('palace') || context.includes('tower');
  const hasDragon = context.includes('dragon') || context.includes('monster') || context.includes('creature');
  const hasMagic = context.includes('magic') || context.includes('spell') || context.includes('enchanted');
  
  if (pageIndex === 0) {
    // First page choices
    if (hasForest) {
      return [
        { text: 'Enter the mysterious forest to find the ancient tree' },
        { text: 'Follow the sparkling path to the magical clearing' }
      ];
    } else if (hasWater) {
      return [
        { text: 'Dive into the crystal-clear water to explore the underwater world' },
        { text: 'Follow the river to discover the hidden waterfall' }
      ];
    } else if (hasCastle) {
      return [
        { text: 'Enter the grand castle to meet the royal family' },
        { text: 'Explore the castle gardens to find the secret passage' }
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
    } else {
      return [
        { text: 'Follow the magical trail to the enchanted garden' },
        { text: 'Enter the mysterious cave to find the hidden treasure' }
      ];
    }
  }
  
  return [];
}

async function generateStorySegmentWithRetries(preferences, previousSegments, lastChoice, pageIndex, maxRetries = 3) {
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

      if (validChoices.length === 2) {
        console.log(`[RETRY ${attempt + 1}] Valid choices found:`, validChoices);
        return { 
          ...result, 
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
  
  const fallbackChoices = generateFallbackChoices(result?.text || '', pageIndex);

  return { 
    text: result?.text || 'A magical story unfolds...',
    choices: fallbackChoices,
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