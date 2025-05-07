import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Story, StoryPreferences, StorySegment, StoryChoice } from '../types/story';
import { generateStorySegment, generateIllustration } from './openaiService';

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end.`;

const cleanChoices = (choices: any) =>
  Array.isArray(choices)
    ? choices
        .filter((c) => c && typeof c.text === 'string')
        .map((c) => ({ text: c.text }))
    : [
        { text: 'Continue the adventure' },
        { text: 'Take a different path' }
      ];

function extractStoryAndChoices(segment: any) {
  let storyText = segment.text;
  let choices = segment.choices;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(storyText);
      storyText = parsed.story || storyText;
      choices = Array.isArray(parsed.choices)
        ? parsed.choices
        : ["Continue the adventure", "Take a different path"];
    } catch {
      // fallback: use as is
    }
  }
  // Ensure storyText is never a JSON string
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    storyText = 'A magical story unfolds...';
  }
  return { text: storyText, choices };
}

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  console.log('[createStory] called with preferences:', preferences);
  try {
    console.log('[createStory] generating story segment...');
    const initial = await generateStorySegment(preferences, []);
    console.log('[createStory] story segment generated:', initial);

    console.log('[createStory] generating illustration...');
    const illustration = await generateIllustration(initial.text);
    console.log('[createStory] illustration generated:', illustration);

    const extracted = extractStoryAndChoices(initial);
    const initialSegment: StorySegment = {
      text: extracted.text || '', // Only the story string, never JSON
      illustration: illustration || '',
      choices: Array.isArray(extracted.choices)
        ? extracted.choices.map((c: string) => ({ text: c }))
        : [
            { text: 'Continue the adventure' },
            { text: 'Take a different path' }
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

  const extracted = extractStoryAndChoices(next);
  // Ensure storyText is never a JSON string
  let storyText = extracted.text;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    storyText = 'A magical story unfolds...';
  }
  const nextSegment: StorySegment = {
    text: storyText || '', // Only the story string, never JSON
    illustration: (await generateIllustration(storyText)) || '',
    choices: Array.isArray(extracted.choices)
      ? extracted.choices.map((c: string) => ({ text: c }))
      : [
          { text: 'Continue the adventure' },
          { text: 'Take a different path' }
        ]
  };

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
}; 