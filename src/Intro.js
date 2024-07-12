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
      <div className="header-content bg_style">
        <div className="title-logo-container">
          <div className="text-content">
            <h2 className="intro-title">Are you in a cult?</h2>
            <h3>
              Evaluate your now by using Dr. Steven Hassan's BITE model
              <sup>&trade;</sup> for Authoritarian Control.
            </h3>
            <h4>
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
                width="50"
                height="50"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="black"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="25"
                  y1="25"
                  x2="25"
                  y2="8"
                  stroke="black"
                  strokeWidth="2"
                />
                <line
                  x1="25"
                  y1="25"
                  x2="35"
                  y2="30"
                  stroke="black"
                  strokeWidth="2"
                />
              </svg>
              <span className="start-item">Take X minutes </span>
            </div>
          </div>
          <div className="author-info">
            <a
              href="http://freedomofmind.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/static/Steve_hand.png"
                className="App-logo"
                alt="Steve Hassan"
              />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Intro;
