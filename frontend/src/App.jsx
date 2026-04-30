import React from 'react';
import ChessBoardComponent from './components/ChessBoardComponent';
import Sidebar from './components/Sidebar';
import { usePuzzle } from './hooks/usePuzzle';

function App() {
  const puzzleState = usePuzzle();

  return (
    <div className="app-container">
      <header className="header">
        <h1>Chess Puzzle Master</h1>
        <p>Sharpen your tactical skills</p>
      </header>
      
      <main className="main-content">
        <ChessBoardComponent {...puzzleState} />
        <Sidebar {...puzzleState} />
      </main>
    </div>
  );
}

export default App;
