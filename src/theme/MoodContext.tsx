import React, { createContext, useContext, useState, ReactNode } from 'react';
import { moodThemes, MoodKey } from './moodThemes';

type MoodContextType = {
  mood: MoodKey;
  setMood: (mood: MoodKey) => void;
  theme: typeof moodThemes[MoodKey];
};

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export const MoodProvider = ({ children }: { children: ReactNode }) => {
  const [mood, setMood] = useState<MoodKey>('bedtime');
  const theme = moodThemes[mood];

  return (
    <MoodContext.Provider value={{ mood, setMood, theme }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const context = useContext(MoodContext);
  if (!context) throw new Error('useMood must be used within a MoodProvider');
  return context;
}; 