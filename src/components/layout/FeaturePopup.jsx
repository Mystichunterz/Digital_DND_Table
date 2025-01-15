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
const FeaturePopup = ({ icon, text, popupContent }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="feature-popup-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* Feature icon and text */}
      <div className="feature-content">
        <img src={icon} alt={text} className="hover-icon" />
        <p>{text}</p>
      </div>

      {/* Popup shown on hover */}
      {isHovered && <div className="popup-window">{popupContent}</div>}
    </div>
  );
};

FeaturePopup.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  popupContent: PropTypes.node.isRequired,
};

//----------------------
//  exports
//----------------------
export default FeaturePopup;
