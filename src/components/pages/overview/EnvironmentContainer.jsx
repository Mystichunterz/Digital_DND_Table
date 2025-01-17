//----------------------
//  src > components > pages > overview > EnvironmentContainer.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useState } from "react";
import "../../../styles/components/pages/overview/environment-container.scss";

const EnvironmentContainer = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [leftCharacter, setLeftCharacter] = useState(null);
  const [rightCharacter, setRightCharacter] = useState(null);

  // Handler for image uploads
  const handleImageUpload = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="environment-container">
      {/* Top Section */}
      <div className="environment-display">
        {backgroundImage ? <img src={backgroundImage} alt="Background" className="background-image" /> : <p>Upload an image to begin</p>}

        {leftCharacter && <img src={leftCharacter} alt="Left Character" className="character left-character" />}
        {rightCharacter && <img src={rightCharacter} alt="Right Character" className="character right-character" />}
      </div>

      {/* Bottom Section - Upload Buttons */}
      <div className="upload-controls">
        <label>
          Background Image
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setBackgroundImage)} />
        </label>
        <label>
          Left Character
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setLeftCharacter)} />
        </label>
        <label>
          Right Character
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, setRightCharacter)} />
        </label>
      </div>
    </div>
  );
};

//----------------------
//  exports
//----------------------
export default EnvironmentContainer;
