import InformationPopup from "../../popups/InformationPopup";
import companionsData from "../../../data/companionsData";

const V2CompanionsPanel = () => {
  return (
    <article className="v2-overview-panel v2-background-panel v2-companions-panel">
      <header className="v2-overview-panel-header">
        <h2>Companions</h2>
      </header>

      <div className="v2-companions-grid">
        {companionsData.map((companion) => {
          if (companion.isEmpty) {
            return (
              <section
                key={companion.id}
                className="v2-companion-card is-empty"
                aria-label={`${companion.name} (empty)`}
              >
                <header className="v2-companion-card-header">
                  <h3>{companion.name}</h3>
                  <span className="v2-companion-role">{companion.role}</span>
                </header>
                <p className="v2-companion-empty-note">{companion.note}</p>
              </section>
            );
          }

          return (
            <section
              key={companion.id}
              className="v2-companion-card"
              aria-label={companion.name}
            >
              <header className="v2-companion-card-header">
                <div>
                  <h3>{companion.name}</h3>
                  <p className="v2-companion-meta">
                    {companion.race} · {companion.classLevel}
                  </p>
                </div>
                <div className="v2-companion-tags">
                  <span>{companion.alignment}</span>
                  <span>{companion.role}</span>
                </div>
              </header>

              <dl className="v2-companion-stat-strip">
                <div>
                  <dt>AC</dt>
                  <dd>{companion.ac}</dd>
                </div>
                <div>
                  <dt>HP</dt>
                  <dd>
                    {companion.hp.current}
                    <span className="v2-companion-stat-divider">/</span>
                    {companion.hp.max}
                  </dd>
                </div>
                <div>
                  <dt>Speed</dt>
                  <dd>{companion.speed} ft</dd>
                </div>
                <div>
                  <dt>Init</dt>
                  <dd>{companion.initiative}</dd>
                </div>
                <div>
                  <dt>Hit Dice</dt>
                  <dd>{companion.hitDice}</dd>
                </div>
              </dl>

              <ul className="v2-companion-abilities">
                {Object.entries(companion.abilities).map(([key, ability]) => (
                  <li key={key}>
                    <span className="v2-companion-ability-label">{key}</span>
                    <strong>{ability.score}</strong>
                    <em>{ability.mod}</em>
                  </li>
                ))}
              </ul>

              {companion.attacks?.length > 0 && (
                <section className="v2-companion-section">
                  <h4>Attacks</h4>
                  <ul className="v2-companion-attack-list">
                    {companion.attacks.map((attack) => (
                      <InformationPopup
                        key={attack.name}
                        title={attack.name}
                        subtitle={`${attack.bonus} to hit · ${attack.damage} ${attack.type}`}
                        description={attack.notes}
                        positionPreference="vertical"
                      >
                        <li className="v2-companion-attack">
                          <span className="v2-companion-attack-name">
                            {attack.name}
                          </span>
                          <span className="v2-companion-attack-bonus">
                            {attack.bonus}
                          </span>
                          <span className="v2-companion-attack-damage">
                            {attack.damage} {attack.type.toLowerCase()}
                          </span>
                        </li>
                      </InformationPopup>
                    ))}
                  </ul>
                </section>
              )}

              {companion.traits?.length > 0 && (
                <section className="v2-companion-section">
                  <h4>Traits</h4>
                  <ul className="v2-companion-trait-list">
                    {companion.traits.map((trait) => (
                      <InformationPopup
                        key={trait.name}
                        title={trait.name}
                        description={trait.text}
                        positionPreference="vertical"
                      >
                        <li className="v2-companion-trait">{trait.name}</li>
                      </InformationPopup>
                    ))}
                  </ul>
                </section>
              )}
            </section>
          );
        })}
      </div>
    </article>
  );
};

export default V2CompanionsPanel;
