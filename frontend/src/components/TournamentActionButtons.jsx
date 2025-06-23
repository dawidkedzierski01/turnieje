import { useLocation } from 'react-router-dom';

export default function TournamentActionButtons({ 
  onGenerate, 
  onReset, 
  onSave, 
  saveLabel, 
  nextStepLabel, 
  nextStepPath, 
  customButtons, 
  showOnlyCurrentRound, 
  toggleShowOnlyCurrentRound,
  hasRounds
}) {
  const location = useLocation();
  const showExtraButton = location.pathname.includes('/wyniki');

  return (
    <div className="tournament-actions">
      {onGenerate && (<button type="button" onClick={onGenerate}>Generuj mecze</button>)}
      {onReset && (<button type="button" onClick={onReset}>Resetuj mecze</button>)}
      {onSave && (<button onClick={onSave} type="button">{saveLabel || 'Zapisz'}</button>)}
      {nextStepPath && (<button onClick={nextStepPath} type="button">{nextStepLabel || 'Przejdź dalej'}</button>)}
      {customButtons && customButtons.map((btn, i) => (<button key={i} type="button" onClick={btn.onClick}>{btn.label}</button>))}
      {showExtraButton && toggleShowOnlyCurrentRound && (
        <button type="button" onClick={toggleShowOnlyCurrentRound} disabled={!hasRounds}>
          {showOnlyCurrentRound ? 'Pokaż wszystkie etapy' : 'Pokaż tylko aktualny etap'}
        </button>
      )}
    </div>
  );
}
