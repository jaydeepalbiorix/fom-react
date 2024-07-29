// Fork.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./App.css";

const Fork = ({ host_development }) => {
  const [email, setEmail] = useState("");
  const [story, setStory] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  const submitStoryText = async (email, story) => {
    try {
      await axios.post(`${host_development}/save_story/`, {
        email,
        story,
      });
    } catch (error) {
      console.error("Error submitting story:", error);
    }
  };

  const handleSurvey = () => {
    submitStoryText(email, story);
    navigate("/survey");
  };
  const handleResults = () => {
    submitStoryText(email, story);
    navigate("/results");
  };

  return (
    <div className="header-content bg_style">
      <div className="fork-section">
        <div className="fork-text-area-container">
          <div className="fork-email">
            <label htmlFor="email" className="email-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="muiInput"
              placeholder="Type your email here.."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <h2>Share Your Story</h2>
        <div>
          <textarea
            className="muiTextarea"
            type="text"
            name="question"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            maxLength={1000}
            rows={10}
          />
        </div>
        <div className="fork-button-container">
          <button className={"button-text"} onClick={handleSurvey}>
            Complete Survey{" "}
          </button>
          <button className={"button-text"} onClick={handleResults}>
            See My Score
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fork;
