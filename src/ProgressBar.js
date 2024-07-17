import React from "react";
import "./ProgressBar.css";
const ProgressBar = ({ answeredCount }) => {
  return (
    <div className="progress-bar">
      <div className="progress-container">
        <progress value={answeredCount / 40} max="1" />
      </div>
    </div>
  );
};

export default ProgressBar;
