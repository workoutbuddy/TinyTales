import React, { useEffect, useState } from 'react';
import { useStory } from '../contexts/StoryContext';

const StoryView: React.FC = () => {
  const { story, currentSegmentIndex } = useStory();
  const currentSegment = story.segments[currentSegmentIndex];
  const rawModelOutputs = currentSegment.rawModelOutputs;

  // Extract story text, ensuring we never show raw JSON
  let storyText = currentSegment.text;
  if (typeof storyText === 'string' && storyText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(storyText);
      storyText = parsed.story || parsed.text || 'A magical story unfolds...';
      if (typeof storyText !== 'string') {
        storyText = 'A magical story unfolds...';
      }
    } catch {
      storyText = 'A magical story unfolds...';
    }
  }

  // Extract choices, ensuring we only show model-generated choices
  let choices: Array<{ text: string }> = [];
  if (rawModelOutputs && rawModelOutputs.length > 0 && Array.isArray(rawModelOutputs[0].choices)) {
    choices = rawModelOutputs[0].choices.map(c => typeof c === 'string' ? { text: c } : c);
  } else if (Array.isArray(currentSegment.choices)) {
    choices = currentSegment.choices.filter(c => 
      typeof c.text === 'string' && 
      !['continue the adventure', 'take a different path', 'do something brave', 'do something silly'].includes(c.text.toLowerCase())
    );
  }

  // If no valid choices, show The End
  if (!choices || choices.length === 0) {
    choices = [{ text: 'The End' }];
  }

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default StoryView; 