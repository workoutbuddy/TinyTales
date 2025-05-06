import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Story, StoryPreferences, StorySegment, StoryChoice } from '../types/story';
import { generateStorySegment, generateIllustration } from './openaiService';

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end.`;

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  console.log('[createStory] called with preferences:', preferences);
  const initial = await generateStorySegment(preferences, []);
  const initialSegment: StorySegment = {
    text: initial.text,
    illustration: await generateIllustration(initial.text),
    choices: initial.choices.map((c: string) => ({ text: c }))
  };

  const story: Omit<Story, 'id'> = {
    preferences,
    segments: [initialSegment],
    currentSegmentIndex: 0,
    createdAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'stories'), story);
  console.log('[createStory] story added to Firestore with id:', docRef.id);
  return docRef.id;
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
    text: next.text,
    illustration: await generateIllustration(next.text),
    choices: next.choices.map((c: string) => ({ text: c }))
  };

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
}; 