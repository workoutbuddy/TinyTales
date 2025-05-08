export interface StoryPreferences {
  childName: string;
  favoriteAnimal: string;
  setting: string;
  characters: string[];
  lifeLesson: string;
  age?: number;
  interests?: string[];
  theme?: string;
  mood?: 'bedtime' | 'silly' | 'bold' | 'curious';
}

export interface StoryChoice {
  text: string;
}

export interface StorySegment {
  text: string;
  illustration: string;
  choices: StoryChoice[];
  rawModelOutputs?: any[];
  isFallback?: boolean;
}

export interface Story {
  id: string;
  userId: string;
  preferences: StoryPreferences;
  segments: StorySegment[];
  currentSegmentIndex: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  status: 'active' | 'ended';
  ending?: string;
} 