import React from 'react';
import { Container, Navbar } from 'react-bootstrap';
import { AppProvider } from './components/AppProvider';
import { Scanner } from './components/Scanner';
import { WineList } from './components/WineList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>Wine Collection Manager</Navbar.Brand>
        </Container>
      </Navbar>
      <Container>
        <Scanner />
        <WineList />
      </Container>
    </AppProvider>
  );
};

export default App;