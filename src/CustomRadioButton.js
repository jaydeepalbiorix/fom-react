import React from "react";

import "./CustomRadioButton.css";

const CustomRadioButton = ({ options, name, selectedRadio, onChange }) => {
  return (
    <div className="radio-group">
      {options.map((option, index) => (
        <label key={index} className="radio-label">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedRadio === option.value}
            onChange={() => onChange(option.value)}
            className="radio-input"
          />
          <span className="custom-radio"></span>
          {option.label}
        </label>
      ))}
    </div>
  );
};

export default CustomRadioButton;
