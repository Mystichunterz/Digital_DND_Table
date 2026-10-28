const ManifestTable = ({ manifest, sortedAbilities, isLoading }) => (
  <article className="v2-asset-manager-card v2-asset-manager-library-card">
    <header>
      <h2>Current Manifest</h2>
      <p>
        Version {manifest.version} • {manifest.abilities.length} ability
        {manifest.abilities.length === 1 ? "" : "ies"}
      </p>
    </header>

    {isLoading ? (
      <p className="v2-asset-manager-empty">Loading asset manager data...</p>
    ) : (
      <div className="v2-asset-manager-table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Section</th>
              <th>Icon</th>
            </tr>
          </thead>
          <tbody>
            {sortedAbilities.map((ability) => (
              <tr key={ability.id}>
                <td>{ability.id}</td>
                <td>{ability.name}</td>
                <td>{ability.category}</td>
                <td>{ability.section}</td>
                <td>{ability.icon ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </article>
);

export default ManifestTable;
