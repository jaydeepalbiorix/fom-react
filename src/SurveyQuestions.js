import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RadioDropdown from "./RadioDropdown.js";
import ProgressBar from "./ProgressBar.js";
import CustomPopup from "./components/CustomPopup/index.js";

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
  const divRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  const [visibility, setVisibility] = useState(false);

  const popupCloseHandler = () => {
    setVisibility(false);
  };

  useEffect(() => { }, [answers]);

  useEffect(() => {
    if (allQuestions && allQuestions.length > 0) {
      if (allQuestions.length >= 39) {
        allQuestions[3].isForty = true;
      }
      let prevPage = currentPage - 2;
      if (prevPage < 0) prevPage = 0;
      const prevQ = allQuestions.slice(prevPage, prevPage + questionsPerPage);
      const optionLength = JSON.parse(prevQ[0]?.valid)?.length;
      const prev_qid = prevQ[0]?.num;
      let advance = 0;
      const start = (advance + currentPage - 1) * questionsPerPage;
      const end = start + questionsPerPage;
      const qlist = allQuestions.slice(start, end);
      if (qlist[0].isForty) {
        setVisibility(true);
      }
      setCurrentQuestions(qlist);
    }
  }, [
    currentPage,
    allQuestions,
    answers,
    questionsPerPage,
    setCurrentQuestions,
  ]);

  const handleNext = (advance_count = 1) => {
    setKeyPress("downKey");
    onPageChange((currentPage) =>
      Math.min(currentPage + advance_count, totalPages)
    );
  };

  const handlePrevious = () => {
    setKeyPress("upKey");
    onPageChange((currentPage) => Math.max(currentPage - 1, 1));
  };
  const handleFirst = () => {
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
    handleAnswerChange(set_id, questionId, answer);
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  const handleAnswerChange = (set_id, question_id, answer_id) => {
    let category_id = allQuestions[question_id]?.category;
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
        newAnswers = [
          ...prevAnswers,
          { question_id: question_id, answer_other: text },
        ];
      }
      return newAnswers;
    });
    submitAnswerOtherText(set_id, question_id, text);
  };

  useEffect(() => {

    if (visibility) {
      return
    }
    const handleScroll = (event) => {
      event.preventDefault();

      const delta = Math.sign(event.deltaY);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        if (delta === -1) {
          setKeyPress("upKey");
          onPageChange((currentPage) => Math.max(currentPage - 1, 1));
        } else if (delta === 1) {
          let advance_count = 1;
          setKeyPress("downKey");
          onPageChange((currentPage) =>
            Math.min(currentPage + advance_count, totalPages)
          );
        }
      }, 150);
    };

    const divElement = divRef.current;
    if (divElement) {
      divElement.addEventListener("wheel", handleScroll);
    }

    // Clean up the event listener when component unmounts
    return () => {
      if (divElement) {
        divElement.removeEventListener("wheel", handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <ProgressBar answeredCount={answeredCount} />
      <div className="main-content bg_style-main-content" ref={divRef}>

        {visibility ? (
          <CustomPopup
            onClose={popupCloseHandler}
            show={visibility}
          >
            <p>Hello</p>
          </CustomPopup>
        ) : (
          <>
            <div className="content-wrapper">
              {currentQuestions?.map((question, qindex) => {
                return (
                  <div
                    key={question.num}
                    className={`question ${question.isForty
                      ? ""
                      : keyPress === "upKey"
                        ? "animationDesignUp"
                        : "animationDesignDown"
                      }`}
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
                );
              })}
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
          </>
        )}
      </div>
    </>
  );
};

export default SurveyQuestions;
