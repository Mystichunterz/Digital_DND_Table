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
const FeaturePopup = ({ popupContent, children }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="feature-popup-wrapper" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}

      {/* Popup shown on hover */}
      {isHovered && <div className="popup-window">{popupContent}</div>}
    </div>
  );
};

FeaturePopup.propTypes = {
  popupContent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
};

//----------------------
//  exports
//----------------------
export default FeaturePopup;
