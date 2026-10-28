import { useEffect, useState } from "react";

const toPreviewUrl = (file) => URL.createObjectURL(file);

const EnvironmentPanel = () => {
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
    <article className="overview-panel environment-panel">
      <header className="overview-panel-header">
        <h2>Environment</h2>
      </header>

      <div className="environment-stage">
        {backgroundImage ? (
          <img
            src={backgroundImage}
            alt="Environment background"
            className="environment-background"
          />
        ) : (
          <p className="environment-empty">
            Upload a background image to begin.
          </p>
        )}

        {leftCharacter && (
          <img
            src={leftCharacter}
            alt="Left character"
            className="environment-character environment-character-left"
          />
        )}

        {rightCharacter && (
          <img
            src={rightCharacter}
            alt="Right character"
            className="environment-character environment-character-right"
          />
        )}
      </div>

      <div className="environment-controls">
        <label htmlFor="background-upload">
          Background
          <input
            id="background-upload"
            type="file"
            accept="image/*"
            onChange={(event) =>
              updatePreview(event, backgroundImage, setBackgroundImage)
            }
          />
        </label>

        <label htmlFor="left-character-upload">
          Left Character
          <input
            id="left-character-upload"
            type="file"
            accept="image/*"
            onChange={(event) =>
              updatePreview(event, leftCharacter, setLeftCharacter)
            }
          />
        </label>

        <label htmlFor="right-character-upload">
          Right Character
          <input
            id="right-character-upload"
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

export default EnvironmentPanel;
