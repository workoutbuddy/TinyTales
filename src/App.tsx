import React from 'react';
import { ChakraProvider, Theme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { NewStory } from './pages/NewStory';
import { StoryView } from './pages/StoryView';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/common/Navigation';
import theme from './theme';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider theme={theme as Theme}>
      <AuthProvider>
      <Router>
          <Navigation />
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/story/new" element={
              <ProtectedRoute>
                <NewStory />
              </ProtectedRoute>
            } />
            <Route path="/story/:storyId" element={
              <ProtectedRoute>
                <StoryView />
              </ProtectedRoute>
            } />
          <Route path="/story" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App; 