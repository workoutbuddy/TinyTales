import { db } from './firebase';
import { collection, addDoc, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Story, StoryPreferences, StorySegment } from '../types/story';

const SYSTEM_PROMPT = `You are a friendly narrator for children aged 4-9. Generate short, engaging, age-appropriate stories with two choices at the end.`;

export const createStory = async (preferences: StoryPreferences): Promise<string> => {
  const initialSegment: StorySegment = {
    text: await generateStorySegment(preferences, []),
    choices: [
      { text: "Enter the cave", nextSegment: "" },
      { text: "Climb the tree", nextSegment: "" }
    ]
  };

  const story: Omit<Story, 'id'> = {
    preferences,
    segments: [initialSegment],
    currentSegmentIndex: 0,
    createdAt: new Date()
  };

  const docRef = await addDoc(collection(db, 'stories'), story);
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

  const nextSegment: StorySegment = {
    text: await generateStorySegment(
      story.preferences,
      story.segments.map(s => s.text),
      choice.text
    ),
    choices: [
      { text: "Continue the adventure", nextSegment: "" },
      { text: "Take a different path", nextSegment: "" }
    ]
  };

  await updateDoc(doc(db, 'stories', storyId), {
    segments: [...story.segments, nextSegment],
    currentSegmentIndex: story.currentSegmentIndex + 1
  });
};

// Mock function for story generation - replace with actual GPT-4 API call
const generateStorySegment = async (
  preferences: StoryPreferences,
  previousSegments: string[],
  lastChoice?: string
): Promise<string> => {
  // This is a placeholder - implement actual GPT-4 API call here
  return `Once upon a time, ${preferences.childName} was playing in the ${preferences.setting} when they met a friendly ${preferences.favoriteAnimal}.`;
}; 