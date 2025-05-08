import React from 'react';
import { HStack, Button, Tooltip } from '@chakra-ui/react';
import { useMood } from '../../theme/MoodContext';
import { moodThemes, MoodKey } from '../../theme/moodThemes';

export const MoodSwitcher: React.FC = () => {
  const { mood, setMood } = useMood();
  return (
    <HStack spacing={2}>
      {Object.entries(moodThemes).map(([key, t]) => (
        <Tooltip key={key} label={t.name} placement="bottom">
          <Button
            onClick={() => setMood(key as MoodKey)}
            variant={mood === key ? 'solid' : 'outline'}
            colorScheme={mood === key ? undefined : 'gray'}
            bg={mood === key ? t.button.bg : undefined}
            color={mood === key ? t.button.color : undefined}
            fontFamily={t.font}
            fontSize="xl"
            px={3}
            py={2}
            _hover={{ bg: t.accent }}
          >
            {t.icon}
          </Button>
        </Tooltip>
      ))}
    </HStack>
  );
}; 