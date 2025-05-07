import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Story, StoryPreferences, StorySegment, StoryChoice } from '../types/story';
import { generateStorySegment, generateIllustration } from './openaiService';

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end.`;

const SHOW_ILLUSTRATIONS = false; // Set to true to enable picture generation

const cleanChoices = (choices: any) =>
  Array.isArray(choices)
    ? choices
        .filter((c) => c && typeof c.text === 'string')
        .map((c) => ({ text: c.text }))
    : [
        { text: 'Continue the adventure' },
        { text: 'Take a different path' }
      ];

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

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  console.log('[createStory] called with preferences:', preferences);
  try {
    console.log('[createStory] generating story segment...');
    const initial = await generateStorySegment(preferences, []);
    console.log('[createStory] story segment generated:', initial);

    let illustration = '';
    if (SHOW_ILLUSTRATIONS) {
      console.log('[createStory] generating illustration...');
      illustration = await generateIllustration(initial.text);
      console.log('[createStory] illustration generated:', illustration);
    }

    const extracted = extractStoryAndChoices(initial);
    const initialSegment: StorySegment = {
      text: extracted.text || '', // Only the story string, never JSON
      illustration: illustration || '',
      choices: Array.isArray(extracted.choices)
        ? extracted.choices.map((c: string) => ({ text: c }))
        : [
            { text: 'Do something brave' },
            { text: 'Do something silly' }
          ]
    };
    console.log('[createStory] initialSegment:', initialSegment);

    const story: Omit<Story, 'id'> = {
      preferences,
      segments: [initialSegment],
      currentSegmentIndex: 0,
      createdAt: new Date()
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

  const next = await generateStorySegment(
    story.preferences,
    story.segments.map(s => s.text),
    choice.text
  );

  let illustration = '';
  if (SHOW_ILLUSTRATIONS) {
    illustration = await generateIllustration(next.text);
  }

  const extracted = extractStoryAndChoices(next);
  // Ensure storyText is never a JSON string
  let storyText = extracted.text;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    storyText = 'A magical story unfolds...';
  }
  const nextSegment: StorySegment = {
    text: storyText || '', // Only the story string, never JSON
    illustration: illustration || '',
    choices: Array.isArray(extracted.choices)
      ? extracted.choices.map((c: string) => ({ text: c }))
      : [
          { text: 'Do something brave' },
          { text: 'Do something silly' }
        ]
  };

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
}; 
}; 