//----------------------
//  src > components > pages > overview > EnvironmentContainer.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import "../../../styles/components/pages/overview/environment-container.scss";

const EnvironmentContainer = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [leftCharacter, setLeftCharacter] = useState(null);
  const [rightCharacter, setRightCharacter] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null); // Track selected element

  // Handlers for uploads
  const handleImageUpload = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  return (
    <div className="environment-container" onClick={() => setSelectedElement(null)}>
      {" "}
      {/* Deselect when clicking outside */}
      {/* Top Section */}
      <div className="environment-display">
        {backgroundImage ? <img src={backgroundImage} alt="Background" className="background-image" /> : <p>Upload an image to begin</p>}

        {leftCharacter && (
          <Draggable bounds="parent">
            <ResizableBox
              width={100}
              height={150}
              minConstraints={[50, 75]}
              maxConstraints={[200, 300]}
              resizeHandles={["se", "sw"]}
              className={`resizable-character ${selectedElement === "left" ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement("left");
              }}
            >
              <img src={leftCharacter} alt="Left Character" className="character" />
            </ResizableBox>
          </Draggable>
        )}

        {rightCharacter && (
          <Draggable bounds="parent">
            <ResizableBox
              width={100}
              height={150}
              minConstraints={[50, 75]}
              maxConstraints={[200, 300]}
              resizeHandles={["se", "sw"]}
              className={`resizable-character ${selectedElement === "right" ? "selected" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement("right");
              }}
            >
              <img src={rightCharacter} alt="Right Character" className="character" />
            </ResizableBox>
          </Draggable>
        )}
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
