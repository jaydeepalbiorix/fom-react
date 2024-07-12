import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RadioDropdown from "./RadioDropdown.js";
import ProgressBar from "./ProgressBar.js";

const SurveyQuestions = ({
  currentPage,
  set_id,
  answers,
  setAnswers,
  allQuestions,
  currentQuestions,
  setCurrentQuestions,
  answeredCount,
  textResponses,
  setTextResponses,
  totalPages,
  onPageChange,
  onDataLoad,
  userUUID,
  host_development,
  questionsPerPage,
}) => {
  const navigate = useNavigate();
  const [keyPress, setKeyPress] = useState("");
  /*  useEffect(() => {
       console.log("allQuestions updated",allQuestions);
  }, [allQuestions] );  
    
  useEffect(() => {
       console.log("currentQuestions updated",currentQuestions);
  }, [currentQuestions] );  */

  useEffect(() => {
    //console.log("answers updated",answers);
  }, [answers]);

  useEffect(() => {
    console.log("textResponses updated:", textResponses);
  }, [textResponses]);

  useEffect(() => {
    if (allQuestions && allQuestions.length > 0) {
      // Calculate the slice of questions to show based on the currentPage
      let prevPage = currentPage - 2;
      if (prevPage < 0) prevPage = 0;
      const prevQ = allQuestions.slice(prevPage, prevPage + questionsPerPage);
      const optionLength = JSON.parse(prevQ[0]?.valid)?.length;
      const prev_qid = prevQ[0]?.num;
      console.log(
        "before page change: pg:",
        prevPage,
        prevQ[0]?.category,
        prevQ[0]?.num,
        optionLength
      );
      let advance = 0;
      const start = (advance + currentPage - 1) * questionsPerPage;
      const end = start + questionsPerPage;
      console.log("   q :", allQuestions.slice(start, end)[0]);
      const qlist = allQuestions.slice(start, end);
      console.log(
        "page change: currentPage:",
        currentPage,
        "start",
        start,
        "adv",
        advance,
        qlist[0].category,
        qlist[0].num,
        JSON.parse(qlist[0].valid)?.length
      );
      setCurrentQuestions(qlist);
    }
  }, [
    currentPage,
    allQuestions,
    answers,
    questionsPerPage,
    setCurrentQuestions,
  ]); // Recalculate displayed questions when currentPage or allQuestions changes

  const handleNext = (advance_count = 1) => {
    setKeyPress("downKey");
    //console.log("set next page current Page",currentPage, "total Pages", totalPages);
    onPageChange((currentPage) =>
      Math.min(currentPage + advance_count, totalPages)
    );
    //console.log("set next page to ",Math.min(currentPage + 1, totalPages), "currentPage",currentPage);
  };

  const handlePrevious = () => {
    setKeyPress("upKey");
    onPageChange((currentPage) => Math.max(currentPage - 1, 1));
    //console.log("set prev page to ",Math.min(currentPage - 1, totalPages), "currentPage",currentPage);
  };
  const handleFirst = () => {
    //console.log("set page to 1");
    onPageChange((currentPage) => 1);
  };
  const handleLast = () => {
    onPageChange((currentPage) => totalPages);
  };
  const handleResults = () => {
    navigate("/fork");
  };

  const submitAnswerRadio = async (set_id, question_id, answer_id) => {
    try {
      console.log(
        " submitAnswerRadio Q:",
        question_id,
        " A:",
        answer_id,
        "set",
        set_id,
        userUUID
      );
      await axios.post(`${host_development}/answer/`, {
        set_id,
        question_id,
        answer_id,
        userUUID,
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };
  const submitAnswerText = async (set_id, question_id, evidence) => {
    try {
      await axios.post(`${host_development}/answer_text/`, {
        set_id,
        question_id,
        evidence,
      });
    } catch (error) {
      console.error("Error submitting evidence:", error);
    }
  };
  const submitAnswerOtherText = async (set_id, question_id, answer_other) => {
    try {
      await axios.post(`${host_development}/answer_other_text/`, {
        set_id,
        question_id,
        answer_other,
      });
    } catch (error) {
      console.error(
        error,
        "Error submitting set_id:",
        set_id,
        "question_id:",
        question_id,
        "other answer:",
        answer_other
      );
    }
  };

  const onAnswerChange = (set_id, questionId, answer) => {
    console.log("onAnswerChange Q:", questionId, "A:", answer);
    handleAnswerChange(set_id, questionId, answer);
    handleNext();
  };

  const handleAnswerChange = (set_id, question_id, answer_id) => {
    let category_id = allQuestions[question_id]?.category;
    console.log(
      "handleAnswerChange for question",
      question_id,
      "A",
      answer_id,
      "cat",
      category_id
    );
    setAnswers((prevAnswers) => {
      return {
        ...prevAnswers,
        [question_id]: {
          set_id: set_id,
          question_id: question_id,
          answer_id: answer_id,
          category: category_id,
        },
      };
    });
    submitAnswerRadio(set_id, question_id, answer_id);
  };

  const onTextOtherChange = (set_id, questionId, answer) => {
    console.log("onTextOtherChange Q:", questionId, "A:", answer);
    handleTextOtherChange(set_id, questionId, answer);
    handleNext();
  };

  const handleTextOtherChange = (set_id, question_id, text) => {
    if (text === undefined) return;
    setTextResponses((prevAnswers) => {
      const exists = prevAnswers.some(
        (answer) => answer.question_id === question_id
      );
      let newAnswers;
      if (exists) {
        newAnswers = prevAnswers.map((answer) =>
          answer.question_id === question_id
            ? { ...answer, answer_other: text }
            : answer
        );
      } else {
        //add new answer
        newAnswers = [
          ...prevAnswers,
          { question_id: question_id, answer_other: text },
        ];
      }
      console.log("update textResponses using", newAnswers);
      return newAnswers;
    });
    console.log("after setTextResponses() q:", question_id, "A:", text);
    submitAnswerOtherText(set_id, question_id, text);
  };

  return (
    <>
      <ProgressBar answeredCount={answeredCount} />
      <div className="main-content bg_style-main-content">
        <div className="content-wrapper">
          {currentQuestions?.map((question, qindex) => (
            <div
              key={question.num}
              className={`question ${
                keyPress === "upKey"
                  ? "animationDesignUp"
                  : "animationDesignDown"
              }`}
              // className="question animationDesignDown"
            >
              <div className="questionText">{question.text}</div>
              <RadioDropdown
                question={question}
                answers={answers}
                handleAnswerChange={onAnswerChange}
                textResponses={textResponses}
                handleTextOtherChange={onTextOtherChange}
                set_id={set_id}
              />
            </div>
          ))}
        </div>
        <div className="pagination-controls">
          <div className="button-container">
            <div className="answered-count">Answered: {answeredCount}</div>
            <div className="buttons-right">
              <button
                className="button"
                onClick={(e) => {
                  e.preventDefault();
                  handlePrevious();
                }}
              >
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <path d="M20 0l20 20H0L20 0z" fill="white" />
                </svg>
              </button>
              <button
                className="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
              >
                <svg width="40" height="20" viewBox="0 0 40 20">
                  <path d="M20 20L0 0h40L20 20z" fill="white" />
                </svg>
              </button>
              <button
                className={"button-text"}
                onClick={(e) => {
                  e.preventDefault();
                  handleResults();
                }}
              >
                Answers | Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SurveyQuestions;
