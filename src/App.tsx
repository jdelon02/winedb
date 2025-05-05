import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { WineProvider } from './contexts/WineContext';
import { Scanner } from './components/Scanner';
import { WineList } from './components/WineList';
import { WineDetail } from './components/WineDetail';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './styles/animations.css';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <WineProvider>
        <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand>Wine Collection Manager</Navbar.Brand>
          </Container>
        </Navbar>
        <Container>
          <Scanner />
          <Routes>
            <Route path="/" element={<WineList />} />
            <Route path="/wine/:id" element={<WineDetail />} />
          </Routes>
        </Container>
      </WineProvider>
    </BrowserRouter>
  );
}

export default App;