function Scoreboard({ score }) {
  return (
    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem' }}>
        <h3>Scoreboard</h3>
        <p>Your Score: {score}</p>
    </div>
  );
}

export default Scoreboard;
