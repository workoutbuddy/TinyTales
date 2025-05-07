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

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  console.log('[createStory] called with preferences:', preferences);
  try {
    console.log('[createStory] generating story segment...');
    const initial = await generateStorySegment(preferences, []);
    console.log('[createStory] story segment generated:', initial);

    console.log('[createStory] generating illustration...');
    const illustration = await generateIllustration(initial.text);
    console.log('[createStory] illustration generated:', illustration);

    const initialSegment: StorySegment = {
      text: initial.text || '',
      illustration: illustration || '',
      choices: cleanChoices(initial.choices)
    };

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

  const nextSegment: StorySegment = {
    text: next.text || '',
    illustration: (await generateIllustration(next.text)) || '',
    choices: cleanChoices(next.choices)
  };

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
}; 