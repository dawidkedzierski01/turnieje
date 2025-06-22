import { useEffect, useState } from 'react';
import MessageBox from './MessageBox';

export default function TeamForm({ teamCount, onSubmit }) {
  const [fields, setFields] = useState(Array.from({ length: teamCount }, () => ''));
  const [error, setError] = useState(null);

  const updateField = (index, value) => {
    const updated = [...fields];
    updated[index] = value;
    setFields(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const filled = fields.filter((name) => name.trim() !== '');
    if (filled.length < 1) {
      setError('Przynajmniej jedna drużyna musi mieć nazwę');
      return;
    }

    onSubmit(filled);
  };

  useEffect(() => {
    setFields(Array.from({ length: teamCount }, () => ''));
  }, [teamCount]);

  return (
    <form onSubmit={handleSubmit}>
      <MessageBox message={error} type="error" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1em',
          marginBottom: '1.5em',
        }}
      >
        {fields.map((value, index) => (
          <div key={index}>
            <label style={{ display: 'block', marginBottom: '0.25em', fontWeight: 'bold' }}>
              Drużyna {index + 1}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateField(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button type="submit" className="top-button">
        Zapisz i przejdź dalej
      </button>
    </form>
  );
}
