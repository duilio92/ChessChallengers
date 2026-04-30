# Chess Puzzle App — React Frontend Specifications

## 1. Overview

The frontend is a React-based single-page application (SPA) responsible for rendering the chessboard, handling user interactions, validating moves, and communicating with the backend API to fetch puzzles.

**Tech Stack**:
- **Framework**: React (built with Vite for fast development)
- **Styling**: Vanilla CSS (for maximum flexibility, no external CSS frameworks)
- **Chess Logic**: `chess.js` (for move generation, validation, and FEN/SAN handling)
- **Chess UI**: `react-chessboard` (for rendering the board and handling drag-and-drop mechanics)
- **Testing**:
  - Unit/Integration Tests: Vitest + React Testing Library
  - End-to-End (E2E) Tests: Playwright
- **State Management**: React Hooks (e.g., custom `usePuzzle` hook)

---

## 2. API Integration (Backend Endpoints)

The frontend will consume the REST API located in the `backend` folder.

**Endpoints in Use**:
- `GET /api/v1/puzzles/random`: Fetches a random puzzle to start a session.
- `GET /api/v1/puzzles/{puzzle_id}`: Fetches a specific puzzle by ID (useful for sharing or replaying).

**Data Model Received (`PuzzleInDB`)**:
```json
{
  "id": "60d5ecb54b1234567890",
  "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5",
  "moves": [
    { "uci": "e4e5", "san": "e5" },
    { "uci": "c6e5", "san": "Nxe5" }
  ],
  "rating": 1200,
  "themes": ["fork", "advantage"]
}
```

---

## 3. Core Interaction Loop

The fundamental flow for solving a puzzle:
**User → Move → Local Legality Check (`chess.js`) → Solution Validation → Result → Feedback → Opponent Move / Next Step**

---

## 4. Feature Specifications

### Feature 1: Start & Load Puzzle Session
**Scenario: Fetch puzzle from API**
- **When** the user starts a new session or clicks "Next Puzzle"
- **Then** the frontend calls `GET /api/v1/puzzles/random`.
- **And** initializes the board with the puzzle's `fen`.
*(Note: Often the first move in the `moves` array is the opponent's move that triggers the puzzle. If so, the frontend must execute this move automatically with a slight delay so the user understands the context).*

**Scenario: API error**
- **When** the puzzle request fails
- **Then** an error message is shown (e.g., "Failed to load puzzle. Please try again.")

**Scenario: Reset puzzle**
- **Given** a puzzle is in progress or failed
- **When** the user clicks "Retry"
- **Then** the board returns to the initial state (the starting `fen` + opponent's initial move if applicable).

### Feature 2: Board Interaction
**Scenario: Select piece (Click to move)**
- **When** the user clicks a piece
- **Then** the piece's square is highlighted, and all legal destination squares are marked with dots.
- **When** the user clicks a valid target square
- **Then** the move is executed locally.

**Scenario: Drag and drop**
- **When** the user drags a piece
- **Then** the piece follows the cursor.
- **When** dropped on a legal square, the move is executed locally.

**Scenario: Illegal move**
- **When** the user attempts an illegal move (determined by `chess.js`)
- **Then** the piece snaps back to its original square and the move is ignored.

### Feature 3: Puzzle Move Validation
**Scenario: Correct move**
- **Given** the current step in the puzzle sequence
- **When** the user plays a legally valid move that matches the expected move in the `moves` array (matched by `uci`)
- **Then** the move is accepted, and a success sound/visual plays.
- **And** if there is a subsequent opponent move in the solution array, it is played automatically after a 300ms-500ms delay.

**Scenario: Incorrect move**
- **Given** the current puzzle step
- **When** the user plays a legally valid move that does **not** match the solution
- **Then** the system rejects the move (undos it on the board).
- **And** an error indicator is shown (e.g., the piece snaps back, screen shakes, or red highlight appears).
- **And** the puzzle status becomes "failed".

### Feature 4: Puzzle Completion
**Scenario: Complete puzzle**
- **Given** the user is on the final user-move of the solution
- **When** the user plays the correct move
- **Then** the puzzle status is marked as "solved".
- **And** a clear success overlay appears containing a "Next Puzzle" button and puzzle stats (e.g., Rating).

### Feature 5: Feedback & Highlighting
**Scenario: Move feedback**
- **Correct move**: Brief green highlight on the target square.
- **Incorrect move**: Brief red highlight on the source/target square, piece visually returns to source.

**Scenario: Show last move**
- **When** any move is played (user or opponent)
- **Then** the source and destination squares of that move are highlighted (e.g., standard yellow overlay).

### Feature 6: Progress Tracking
**Scenario: Track and display progress**
- **When** the user successfully completes a puzzle
- **Then** the session progress count is incremented (e.g., "Puzzles Solved: 5").
- **And** the frontend displays this counter in the UI.

---

## 5. Architecture & State Management

**State to Track (`usePuzzle` hook)**:
- `puzzleData`: Data fetched from backend (`PuzzleInDB` or null).
- `game`: Instance of `chess.js` tracking current board state.
- `status`: `"loading" | "in_progress" | "solved" | "failed"`.
- `currentMoveIndex`: Integer tracking progress through the solution array.
- `history`: Local move history for the current session.

**Directory Structure Idea**:
```text
frontend/
├── src/
│   ├── components/
│   │   ├── ChessBoard/      # Renders react-chessboard and handles highlights
│   │   ├── Controls/        # Next/Retry buttons, progress tracking UI
│   │   ├── Feedback/        # Alerts/Overlays for Solved/Failed states
│   ├── hooks/
│   │   └── usePuzzle.js     # Core logic: interacts with API and chess.js
│   ├── services/
│   │   └── api.js           # Axios/Fetch wrappers for backend endpoints
│   ├── App.jsx              # Main view
│   └── index.css            # Vanilla CSS design system
```

---

## 6. Testing Requirements
- **Unit Tests (Vitest)**:
  - Mock backend responses for `/api/v1/puzzles/random`.
  - Test the `usePuzzle` hook: check if valid moves advance the `currentMoveIndex`, and invalid moves set status to `"failed"`.
- **E2E Tests (Playwright)**:
  - Start the app, intercept the backend call and inject a known puzzle.
  - Perform drag-and-drop actions on the board to simulate correct and incorrect user behavior.
  - Assert that the "Solved" or "Failed" UI appears correctly based on the interactions.
