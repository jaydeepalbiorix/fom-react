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
    // Handle form submission, e.g., send data to server
    console.log("Email:", email);
    console.log("Story:", story);
  };
  /*const handleBlur = (e) => {
    handleTextOtherChange(set_id, question.num, e.target.value);
  };

  const handleButtonClick = () => {
    handleTextOtherChange(set_id, question.num, localText);
  };*/
  const submitStoryText = async (email, story) => {
    console.log("save ", email, "story", story);
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
  const handleCancel = () => {
    navigate("/"); // Navigate back to the home page or another route
  };

  return (
    <div className="header-content bg_style">
      <div className="fork-text-area-container">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <h2>Share Your Story</h2>
      <div>
        <textarea
          className="inputText"
          type="text"
          name={`question`}
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
  );
};

export default Fork;
