import React, { useState, useEffect } from "react";
import Select from "react-select";
import CustomRadioButton from "./CustomRadioButton.js";
import SelectableSquares from "./SelectableSquares.js";

const QuestionRenderer = ({
  question,
  selectedOption,
  handleOptionSelect,
  handleTextOtherChange,
  set_id,
  textResponses,
  options,
  onNumericChange,
  selectedAnswer,
  handleRadioChange,
}) => {
  const validOptions = JSON.parse(question.valid) || [];
  const initialTextResponse =
    textResponses?.find((item) => item.question_id === question.num)
      ?.answer_other ?? "";
  const [localText, setLocalText] = useState(initialTextResponse);

  const handleLocalChange = (e) => {
    setLocalText(e.target.value);
  };

  const handleBlur = (e) => {
    handleTextOtherChange(set_id, question.num, e.target.value);
  };

  const handleButtonClick = () => {
    handleTextOtherChange(set_id, question.num, localText, "buttonClicked");
  };

  useEffect(() => {
    const handleKeyPress2 = (event) => {
      if (event.key === "Enter") {
        handleTextOtherChange(set_id, question.num, event.target.value);
      }
    };
    window.addEventListener("keydown", handleKeyPress2);

    return () => {
      window.removeEventListener("keydown", handleKeyPress2);
    };
  }, []);

  if (question.ftype === "Numeric" && question.category !== "D") {
    if (validOptions.length < 8) {
      return (
        <div key={`choice-${question.num}`} className="radioWrapper">
          <SelectableSquares
            questionNum={question.num}
            options={validOptions}
            selectedOption={selectedOption?.value}
            onOptionSelect={handleOptionSelect}
          />
        </div>
      );
    } else {
      return (
        <Select
          key={`select-${question.num}`}
          className="selectStyle"
          value={selectedOption}
          onChange={onNumericChange}
          options={options}
        />
      );
    }
  } else if (question.ftype === "String" && Array.isArray(textResponses)) {
    return (
      <>
        <input
          autocomplete="off"
          key={`input-${question.num}`}
          className="inputText"
          placeholder="Type your answer here.."
          type="text"
          name={`question-${question.num}`}
          value={localText}
          onChange={handleLocalChange}
          onBlur={handleBlur}
        />
        <button className="button-text" onClick={handleButtonClick}>
          Ok
        </button>
      </>
    );
  } else {
    if (validOptions.length < 8) {
      return (
        <CustomRadioButton
          options={options}
          name={`question-${question.num}`}
          selectedRadio={selectedAnswer}
          onChange={(selectedRadio) =>
            handleRadioChange(selectedRadio, set_id, question.num)
          }
        />
      );
    } else {
      return (
        <Select
          key={`select-${question.num}`}
          className={`selectStyle`}
          value={selectedOption}
          onChange={onNumericChange}
          options={options}
          menuPlacement="auto"
          menuPortalTarget={document.body}
        />
      );
    }
  }
};

export default QuestionRenderer;
