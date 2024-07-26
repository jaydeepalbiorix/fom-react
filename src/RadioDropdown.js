import React from "react";
import QuestionRenderer from "./QuestionRenderer.js";

const RadioDropdown = ({
  question,
  answers,
  handleAnswerChange,
  textResponses,
  handleTextOtherChange,
  set_id,
}) => {
  const options = JSON.parse(question?.valid)?.map((choice, index) => ({
    value: index + 1,
    label: choice,
  }));
  const selectedOption = options?.find(
    (option) => option.value === answers[question.num]?.answer_id
  );

  const handleOptionSelect = (questionNum, option) => {
    handleAnswerChange(set_id, questionNum, option);
  };

  const selectedAnswer = answers[question.num]?.answer_id;

  const onNumericChange = (selectedOption) => {
    handleAnswerChange(set_id, question.num, selectedOption.value);
  };

  const handleRadioChange = (value, set_id, questionNum) => {
    handleAnswerChange(set_id, questionNum, value);
  };

  return (
    <div className={` ${question.showPopUp ? "isVisibleSelect" : ""}`}>
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
