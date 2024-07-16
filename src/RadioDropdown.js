import React from "react";
//import Select from 'react-select';
//import { useState} from 'react';
//import SelectableSquares from './SelectableSquares.js';
//import CustomRadioButton from './CustomRadioButton.js';
import QuestionRenderer from "./QuestionRenderer.js";

const RadioDropdown = ({
  question,
  answers,
  handleAnswerChange,
  textResponses,
  handleTextOtherChange,
  set_id,
}) => {
  //const [selectedRadio, setSelectedRadio] = useState(null);
  // Convert your valid options to a format react-select understands

  const options = JSON.parse(question?.valid)?.map((choice, index) => ({
    value: index + 1,
    label: choice,
  }));
  // Find the selected option based on the current answer
  const selectedOption = options?.find(
    (option) => option.value === answers[question.num]?.answer_id
  );

  const handleOptionSelect = (questionNum, option) => {
    handleAnswerChange(set_id, questionNum, option);
  };

  const selectedAnswer = answers[question.num]?.answer_id;

  // Handler for when a new option is selected
  const onNumericChange = (selectedOption) => {
    handleAnswerChange(set_id, question.num, selectedOption.value);
  };

  const handleRadioChange = (value, set_id, questionNum) => {
    //setSelectedRadio(value);
    handleAnswerChange(set_id, questionNum, value);
  };

  //console.log("selectedOption",selectedOption, "selectedAnswer",selectedAnswer);
  return (
    <div className={` ${question.isForty ? "isVisibleSelect" : ""}`}>
      <QuestionRenderer
        key={question.num}
        question={question}
        selectedOption={selectedOption}
        handleOptionSelect={handleOptionSelect}
        handleTextOtherChange={handleTextOtherChange}
        set_id={set_id}
        textResponses={textResponses}
        options={options}
        onNumericChange={onNumericChange}
        selectedAnswer={selectedAnswer}
        handleRadioChange={handleRadioChange}
      />
    </div>
  );
};
export default RadioDropdown;
