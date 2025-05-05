export interface StoryPreferences {
  childName: string;
  favoriteAnimal: string;
  setting: string;
  characters: string[];
}

export interface StoryChoice {
  text: string;
  nextSegment: string;
}

export interface StorySegment {
  text: string;
  choices: StoryChoice[];
  illustration: string;
}

export interface Story {
  id: string;
  preferences: StoryPreferences;
  segments: StorySegment[];
  currentSegmentIndex: number;
  createdAt: Date;
} 