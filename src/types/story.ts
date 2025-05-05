export interface StoryPreferences {
  setting: string;
  childName: string;
  characters: Array<any>;
  favoriteAnimal: string;
  lifeLesson: string;
}

export interface StoryChoice {
  text: string;
  nextSegment?: string;
}

export interface StorySegment {
  text: string;
  illustration: string;
  choices: StoryChoice[];
}

export interface Story {
  id: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  currentSegmentIndex: number;
  preferences: StoryPreferences;
  segments: StorySegment[];
} 