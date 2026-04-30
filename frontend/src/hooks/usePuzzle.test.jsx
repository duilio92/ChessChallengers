import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePuzzle } from './usePuzzle';
import * as api from '../services/api';

vi.mock('../services/api');

const mockPuzzle = {
  id: "test1",
  fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  moves: [
    { uci: "e2e4", san: "e4" },
    { uci: "e7e5", san: "e5" }
  ],
  rating: 1200,
  themes: ["opening"]
};

describe('usePuzzle hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchRandomPuzzle.mockResolvedValue(mockPuzzle);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads a puzzle correctly', async () => {
    const { result } = renderHook(() => usePuzzle());
    
    expect(result.current.status).toBe('loading');
    
    await act(async () => {
      // wait for the promise to resolve
      await Promise.resolve();
    });

    expect(result.current.status).toBe('in_progress');
    expect(result.current.puzzleData).toEqual(mockPuzzle);
    expect(result.current.game.fen()).toBe(mockPuzzle.fen);
  });

  it('handles a correct move and opponent auto-reply', async () => {
    const { result } = renderHook(() => usePuzzle());
    
    await act(async () => {
      await Promise.resolve();
    });

    // Make correct move e2e4
    let success;
    act(() => {
      success = result.current.makeMove('e2', 'e4', 'wP');
    });

    expect(success).toBe(true);
    
    // After our move, it's not solved yet, we wait for opponent auto-reply
    expect(result.current.status).toBe('in_progress');
    
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Next move is opponent's e7e5. Since it's the last move, it should be solved.
    expect(result.current.status).toBe('solved');
    expect(result.current.stats.solved).toBe(1);
  });

  it('rejects an incorrect move', async () => {
    const { result } = renderHook(() => usePuzzle());
    
    await act(async () => {
      await Promise.resolve();
    });

    // Make an incorrect but legally valid move (e.g., b1c3)
    let success;
    act(() => {
      success = result.current.makeMove('b1', 'c3', 'wN');
    });

    expect(success).toBe(false);
    expect(result.current.status).toBe('failed');
    expect(result.current.stats.failed).toBe(1);
  });
});
