import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Intro.css";

const Intro = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    navigate("/survey");
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        handleStartClick();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <header className="App-header">
      <div className="parent-container">
        <div className="main-container">
          <h2 className="que-title">Are you in a cult?</h2>
          <h3 className="fw-normal">
            Evaluate your now by using Dr. Steven Hassan's BITE model
            <sup>&trade;</sup> for Authoritarian Control.
          </h3>
          <h4 className="fw-normal">
            "Any healthy group or relationship can hold up to any scrutiny"
          </h4>
          <div className="start-button-container">
            <button className="start-button" onClick={handleStartClick}>
              Start Now
            </button>
            <span>
              {" "}
              press <b>Enter&nbsp;&lt;</b>
            </span>
          </div>
          <div className="svg-text-container">
            <svg
              className="start-svg"
              width="25"
              height="25"
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="25"
                cy="25"
                r="20"
                stroke="black"
                strokeWidth="2"
                fill="#2E2C2C"
              />
              <line
                x1="25"
                y1="25"
                x2="25"
                y2="8"
                stroke="white"
                strokeWidth="2"
              />
              <line
                x1="25"
                y1="25"
                x2="35"
                y2="30"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
            <span className="start-item">Take X minutes </span>
          </div>
        </div>
        <div className="img-container">
          <img src="https://images.typeform.com/images/UJJfTEr2Kd5p/image/default-firstframe.png" />         </div>
      </div>
    </header>
  );
};

export default Intro;
