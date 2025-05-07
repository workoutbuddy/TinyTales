import React from 'react';
import { ChakraProvider, Theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { NewStory } from './pages/NewStory';
import { StoryView } from './pages/StoryView';
import theme from './theme';

function App() {
  return (
    <ChakraProvider theme={theme as Theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story/new" element={<NewStory />} />
          <Route path="/story/:storyId" element={<StoryView />} />
          <Route path="/story" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App; 