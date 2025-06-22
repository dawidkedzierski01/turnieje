
function TournamentActionButtons({ onGenerate, onReset, onSave, nextStepLabel, nextStepPath }) {
  return (
    <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', marginBottom: '1em' }}>
      {onGenerate && <button onClick={onGenerate}>Generuj mecze</button>}
      {onReset && <button onClick={onReset}>Resetuj mecze</button>}
      {onSave && <button onClick={onSave}>Zapisz</button>}
      {nextStepPath && <button onClick={nextStepPath}>{nextStepLabel || 'Dalej'}</button>}
    </div>
  );
}

export default TournamentActionButtons;
