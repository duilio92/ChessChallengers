import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';

const ChessBoardComponent = ({ game, status, makeMove }) => {
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});

  const onDrop = (sourceSquare, targetSquare, piece) => {
    const isSuccess = makeMove(sourceSquare, targetSquare, piece);
    setMoveSquares({});
    setOptionSquares({});
    return isSuccess;
  };

  const getMoveOptions = (square) => {
    // get all legal moves for the piece on the selected square
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  };

  const onSquareClick = (square) => {
    if (status !== 'in_progress') return;

    // From square was already selected
    const selectedSquare = Object.keys(optionSquares).find(
      s => optionSquares[s].background === 'rgba(255, 255, 0, 0.4)'
    );

    if (selectedSquare) {
      const isMoved = makeMove(selectedSquare, square);
      if (isMoved) {
        setOptionSquares({});
        return;
      }
    }
    getMoveOptions(square);
  };

  return (
    <div className={`board-container ${status === 'failed' ? 'shake' : ''}`}>
      <Chessboard 
        position={game.fen()} 
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        animationDuration={300}
        customDarkSquareStyle={{ backgroundColor: 'var(--board-dark)' }}
        customLightSquareStyle={{ backgroundColor: 'var(--board-light)' }}
        customSquareStyles={{ ...moveSquares, ...optionSquares }}
        boardOrientation={game.turn() === 'w' ? 'white' : 'black'}
      />
      
      {status === 'solved' && (
        <div className="overlay success">
          <h2>Puzzle Solved!</h2>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="overlay error">
          <h2>Incorrect Move</h2>
        </div>
      )}
    </div>
  );
};

export default ChessBoardComponent;
