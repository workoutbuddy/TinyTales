export interface StoryPreferences {
  childName?: string;
  age?: number;
  interests?: string[];
  theme?: string;
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
  preferences: StoryPreferences;
  segments: StorySegment[];
  currentSegmentIndex: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
} 