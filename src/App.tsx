import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import WineList from './components/WineList';
import WineDetail from './components/WineDetail';
import { WineProvider } from './context/WineContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <WineProvider>
        <Router>
          <Container className="app-container">
            <div className="wine-app">
              <Routes>
                <Route path="/" element={<WineList />} />
                <Route path="/wine/:id" element={<WineDetail />} />
              </Routes>
            </div>
          </Container>
        </Router>
      </WineProvider>
    </ErrorBoundary>
  );
};

export default App;