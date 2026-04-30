import { useState, useEffect, useCallback, useRef } from 'react';
import { Chess } from 'chess.js';
import { fetchRandomPuzzle } from '../services/api';

export function usePuzzle() {
  const [game, setGame] = useState(new Chess());
  const [puzzleData, setPuzzleData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, in_progress, solved, failed
  const [moveIndex, setMoveIndex] = useState(0);
  const [stats, setStats] = useState({ solved: 0, failed: 0 });
  
  // Need a ref to the latest state to avoid closure issues in timeouts
  const stateRef = useRef({ moveIndex, puzzleData, game, status });
  
  useEffect(() => {
    stateRef.current = { moveIndex, puzzleData, game, status };
  }, [moveIndex, puzzleData, game, status]);

  const loadNewPuzzle = useCallback(async () => {
    try {
      setStatus('loading');
      const data = await fetchRandomPuzzle();
      setPuzzleData(data);
      const newGame = new Chess(data.fen);
      setGame(newGame);
      setMoveIndex(0);
      setStatus('in_progress');
      
      // If the puzzle starts with the opponent's turn, we might need to play it.
      // However, usually solution moves start with the user's correct move.
      // We will assume alternate turns starting with user.
    } catch (error) {
      console.error("Failed to load puzzle:", error);
      setStatus('failed_load');
    }
  }, []);

  useEffect(() => {
    loadNewPuzzle();
  }, [loadNewPuzzle]);

  const makeMove = useCallback((sourceSquare, targetSquare, piece) => {
    const currentState = stateRef.current;
    if (currentState.status !== 'in_progress') return false;

    const currentGame = new Chess(currentState.game.fen());
    
    try {
      // Create promotion to Queen by default if moving to last rank
      let promotion = undefined;
      if (piece && piece[1] === 'P') {
        const isWhitePromotion = piece[0] === 'w' && targetSquare[1] === '8';
        const isBlackPromotion = piece[0] === 'b' && targetSquare[1] === '1';
        if (isWhitePromotion || isBlackPromotion) promotion = 'q';
      }

      const moveObj = {
        from: sourceSquare,
        to: targetSquare,
        promotion
      };

      // Is it a legally valid move on the board?
      const result = currentGame.move(moveObj);
      if (!result) return false;

      // It is a valid chess move. Does it match the puzzle solution?
      const expectedMove = currentState.puzzleData.moves[currentState.moveIndex];
      const moveUci = result.from + result.to + (result.promotion || '');
      
      if (expectedMove && (expectedMove.uci === moveUci || expectedMove === moveUci)) {
        // Correct move
        setGame(currentGame);
        const nextIndex = currentState.moveIndex + 1;
        setMoveIndex(nextIndex);
        
        // Did we finish the puzzle?
        if (nextIndex >= currentState.puzzleData.moves.length) {
          setStatus('solved');
          setStats(s => ({ ...s, solved: s.solved + 1 }));
          return true;
        }

        // Auto-play opponent's move
        setTimeout(() => {
          const freshState = stateRef.current;
          if (freshState.status !== 'in_progress') return;
          
          const oppMove = freshState.puzzleData.moves[nextIndex];
          if (oppMove) {
            const autoGame = new Chess(freshState.game.fen());
            
            // Extract uci parts, e.g., 'e7e5' -> from: 'e7', to: 'e5'
            // Handle optional promotion character like 'e7e8q'
            const oppUci = oppMove.uci || oppMove;
            const from = oppUci.substring(0, 2);
            const to = oppUci.substring(2, 4);
            const promo = oppUci.length === 5 ? oppUci[4] : undefined;
            
            autoGame.move({ from, to, promotion: promo });
            setGame(autoGame);
            
            const newNextIndex = nextIndex + 1;
            setMoveIndex(newNextIndex);
            
            if (newNextIndex >= freshState.puzzleData.moves.length) {
              setStatus('solved');
              setStats(s => ({ ...s, solved: s.solved + 1 }));
            }
          }
        }, 500);

        return true;
      } else {
        // Incorrect move
        setStatus('failed');
        setStats(s => ({ ...s, failed: s.failed + 1 }));
        // We don't update the game state, so the piece visually snaps back
        return false;
      }
    } catch (e) {
      console.log("Invalid move caught", e);
      return false;
    }
  }, []);

  const retryPuzzle = useCallback(() => {
    if (puzzleData) {
      setGame(new Chess(puzzleData.fen));
      setMoveIndex(0);
      setStatus('in_progress');
    }
  }, [puzzleData]);

  return {
    game,
    puzzleData,
    status,
    stats,
    makeMove,
    loadNewPuzzle,
    retryPuzzle
  };
}
