//----------------------
//  src > layout > FeaturePopup.jsx
//----------------------

//----------------------
//  imports
//----------------------
import { useState } from "react";
import PropTypes from "prop-types";

import "../../styles/components/layout/FeaturePopup.scss";

//----------------------
//  main
//----------------------
const FeaturePopup = ({ icon, title, subtitle, text, children }) => {
  const [isHovered, setIsHovered] = useState(false);
  console.log("Data received by FeaturePopup: ", icon, title, subtitle, text, children);

  return (
    <div className="feature-popup-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}

      {/* Popup shown on hover */}
      {isHovered && (
        <div className="popup-window">
          {/* Left container: title, subtitle, and text */}
          <div className="popup-content">
            <h5 className="popup-title">{title}</h5>
            <p className="popup-subtitle">{subtitle}</p>
            <p className="popup-text">{text}</p>
          </div>
          {/* Right container: image */}
          <div className="popup-image-container">
            <img src={icon} alt={title} className="popup-image" />
          </div>
        </div>
      )}
    </div>
  );
};

FeaturePopup.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

//----------------------
//  exports
//----------------------
export default FeaturePopup;
