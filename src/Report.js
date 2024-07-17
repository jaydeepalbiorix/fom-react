import React, { useEffect } from "react";

const Report = ({ questions, answers, textResponses }) => {
  useEffect(() => {}, [textResponses, answers, questions]);
  return (
    <div>
      <div>Your Answers</div>
      {questions?.map((question, qindex) => {
        let validOptions = [];
        try {
          validOptions = JSON.parse(question.valid);
        } catch (e) {
          console.error(
            "Error parsing valid options for question",
            question.num,
            e
          );
        }
        let answerText = "";
        if (question.ftype === "Numeric" && validOptions.length > 0) {
          answerText = validOptions[answers[qindex + 1]?.answer_id - 1] || "";
        } else if (question.ftype === "String") {
          answerText =
            textResponses?.find((item) => item.question_id === question.num)
              ?.answer_other || "";
        }
        return (
          <div key={question.num} className="question">
            <div>
              {" "}
              {question.text}
              <b> {answerText}</b>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Report;
