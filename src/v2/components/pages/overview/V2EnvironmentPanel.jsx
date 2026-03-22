import { useEffect, useState } from "react";

const toPreviewUrl = (file) => URL.createObjectURL(file);

const V2EnvironmentPanel = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [leftCharacter, setLeftCharacter] = useState(null);
  const [rightCharacter, setRightCharacter] = useState(null);

  useEffect(
    () => () => {
      if (backgroundImage) URL.revokeObjectURL(backgroundImage);
      if (leftCharacter) URL.revokeObjectURL(leftCharacter);
      if (rightCharacter) URL.revokeObjectURL(rightCharacter);
    },
    [backgroundImage, leftCharacter, rightCharacter],
  );

  const updatePreview = (event, currentUrl, setter) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (currentUrl) URL.revokeObjectURL(currentUrl);
    setter(toPreviewUrl(file));
  };

  return (
    <article className="v2-overview-panel v2-environment-panel">
      <header className="v2-overview-panel-header">
        <h2>Environment</h2>
      </header>

      <div className="v2-environment-stage">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Environment background"
            className="v2-environment-background"
          />
        ) : (
          <p className="v2-environment-empty">
            Upload a background image to begin.
          </p>
        )}

        {leftCharacter && (
          <img
            src={leftCharacter}
            alt="Left character"
            className="v2-environment-character v2-environment-character-left"
          />
        )}

        {rightCharacter && (
          <img
            src={rightCharacter}
            alt="Right character"
            className="v2-environment-character v2-environment-character-right"
          />
        )}
      </div>

      <div className="v2-environment-controls">
        <label htmlFor="v2-background-upload">
          Background
          <input
            id="v2-background-upload"
            type="file"
            accept="image/*"
            onChange={(event) =>
              updatePreview(event, backgroundImage, setBackgroundImage)
            }
          />
        </label>

        <label htmlFor="v2-left-character-upload">
          Left Character
          <input
            id="v2-left-character-upload"
            type="file"
            accept="image/*"
            onChange={(event) =>
              updatePreview(event, leftCharacter, setLeftCharacter)
            }
          />
        </label>

        <label htmlFor="v2-right-character-upload">
          Right Character
          <input
            id="v2-right-character-upload"
            type="file"
            accept="image/*"
            onChange={(event) =>
              updatePreview(event, rightCharacter, setRightCharacter)
            }
          />
        </label>
      </div>
    </article>
  );
};

export default V2EnvironmentPanel;
