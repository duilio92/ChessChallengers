import React from 'react';

const Sidebar = ({ status, stats, puzzleData, loadNewPuzzle, retryPuzzle }) => {
  return (
    <div className="sidebar">
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">Solved</span>
          <span className="stat-value" style={{ color: 'var(--success-color)' }}>{stats.solved}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Failed</span>
          <span className="stat-value" style={{ color: 'var(--error-color)' }}>{stats.failed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rating</span>
          <span className="stat-value">{puzzleData?.rating || '---'}</span>
        </div>
      </div>

      <div className={`status-indicator status-${status}`}>
        {status === 'loading' && <div className="spinner" style={{margin: '0 auto'}}></div>}
        {status === 'in_progress' && "Find the best move"}
        {status === 'solved' && "Brilliant! Puzzle Solved."}
        {status === 'failed' && "Incorrect. Try again!"}
      </div>

      <div className="controls">
        <button 
          className="btn" 
          onClick={loadNewPuzzle}
          disabled={status === 'loading'}
        >
          {status === 'solved' || status === 'failed' ? 'Next Puzzle' : 'Skip Puzzle'}
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={retryPuzzle}
          disabled={status === 'in_progress' || status === 'loading'}
        >
          Retry Current
        </button>
      </div>
      
      {puzzleData?.themes && puzzleData.themes.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <span className="stat-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Themes</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {puzzleData.themes.map(t => (
              <span key={t} style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '0.2rem 0.5rem', 
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)'
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
