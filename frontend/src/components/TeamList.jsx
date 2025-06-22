export default function TeamList({ teams, onDelete }) {
  return (
    <table className="main-table" style={{ marginTop: '1em' }}>
      <thead>
        <tr>
          <th>#</th>
          <th>Nazwa drużyny</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team, index) => (
          <tr key={team.id}>
            <td>{index + 1}</td>
            <td>{team.nazwa}</td>
            <td>
              <button onClick={() => onDelete(team.id)}>Usuń</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
