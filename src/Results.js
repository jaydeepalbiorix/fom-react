import axios from "axios";
import React, { useRef, useEffect, useState, useCallback } from "react";
import ShareComponent from "./ShareComponent.js";
import SVGContainer from "./SVGContainer.js";
import PDFGenerator from "./components/PDF/PDFGenerator.js";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import "./Results.css";

const Results = ({
  allQuestions,
  answers,
  textResponses,
  userUUID,
  questions,
  host_development,
  isHeaderSet,
}) => {
  const [biteScore, setBiteScore] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [divWidth, setDivWidth] = useState(0);
  const svgContainerRef = useRef(null);
  const hiddenSvgRef = useRef(null);
  const reportControlsRef = useRef(null);
  const navigate = useNavigate();
  const [heights, setHeights] = useState([]);
  const [isResultLoaded, setResultLoaded] = useState(false);
  const [updatedQuestions, setUpdatedQuestions] = useState([]);
  const [groupedQuestions, setGroupedQuestions] = useState({
    B: [],
    I: [],
    T: [],
    E: [],
    D: [],
  });

  useEffect(() => {
    const answersArray = Object.values(answers);
    if (Array.isArray(answersArray)) {
      if (answersArray.length > 1) {
        setDivWidth(400);
      }
    }
  }, [answers]);

  useEffect(() => {
    const updateDivWidth = () => {
      if (reportControlsRef.current) {
        setDivWidth(reportControlsRef.current.offsetWidth);
      }
    };

    updateDivWidth();

    window.addEventListener("resize", updateDivWidth);

    return () => {
      window.removeEventListener("resize", updateDivWidth);
    };
  }, []);

  useEffect(() => {
    if (reportControlsRef.current) {
      setDivWidth(reportControlsRef.current.offsetWidth);
    }
  }, [reportControlsRef.current]);

  const calculateScore = useCallback(async () => {
    if (userUUID && isHeaderSet) {
      try {
        const response = await axios.get(`${host_development}/get_score/1`);
        const data = response.data;
        const total = Math.round(
          data.find((answer) => answer.category === "total")["score"],
          0
        );
        const b_score = Math.round(
          data.find((answer) => answer.category === "B")["score"],
          0
        );
        const i_score = Math.round(
          data.find((answer) => answer.category === "I")["score"],
          0
        );
        const t_score = Math.round(
          data.find((answer) => answer.category === "T")["score"],
          0
        );
        const e_score = Math.round(
          data.find((answer) => answer.category === "E")["score"],
          0
        );
        setBiteScore([total, b_score, i_score, t_score, e_score]);
      } catch (error) {
        if (error.response) {
          setLoading(false);
          console.error("Backend returned an error:", error.response.data);
          console.error("Status code:", error.response.status);
          if (error.response.status === 400) {
            setLoading(false);
            setBiteScore([-1]);
          }
        } else if (error.request) {
          setLoading(false);
          console.error("No response received:", error.request);
        } else {
          setLoading(false);
          console.error("Error", error.message);
        }
      }
    } else {
    }
  }, [host_development, userUUID, isHeaderSet]);

  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  useEffect(() => {
    if (isDataLoaded && divWidth > 0) {
      let currentY = 700;
      const maxWidth = divWidth - 100;
      const h = [];

      allQuestions.forEach((question) => {
        const text = `${question.text} ${question.answer_text}`;
        const textHeight = calculateWrappedTextHeight(
          text,
          maxWidth,
          20,
          question.num
        );
        h.push({
          num: question.num,
          height: textHeight,
          question: question.text,
        });
        currentY += textHeight + 0;
      });

      setHeights(h);
    }
  }, [isDataLoaded, allQuestions, divWidth]);

  useEffect(() => {
    if (answers && textResponses) {
      const answersArray = Object.values(answers);
      if (Array.isArray(answersArray) && answersArray.length > 1) {
        const updatedQuestionsList = questions
          .map((question) => {
            const matchingAnswer = answersArray.find(
              (answer) => answer.question_id === question.num
            );
            if (matchingAnswer) {
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
                answerText = validOptions[matchingAnswer.answer_id - 1];
              } else if (question.ftype === "String") {
                answerText =
                  textResponses?.find(
                    (item) => item.question_id === question.num
                  )?.answer_other || "";
              }
              const height =
                heights.find((h) => h.num === question.num)?.height || 0;
              return {
                ...question,
                height,
                answer_id: matchingAnswer.answer_id,
                answer_text: answerText,
              };
            }
            return null;
          })
          .filter((question) => question !== null);

        const newGroupedQuestions = {
          B: [],
          I: [],
          T: [],
          E: [],
          D: [],
        };

        setUpdatedQuestions(updatedQuestionsList);
        updatedQuestionsList.forEach((question) => {
          newGroupedQuestions[question.category].push(question);
        });

        setGroupedQuestions(newGroupedQuestions);
        setIsDataLoaded(true);
      }
    }
  }, [answers, questions, textResponses, heights]);

  useEffect(() => {
  }, [groupedQuestions]);

  useEffect(() => {
    setIsDataLoaded(true);
  }, [heights]);

  useEffect(() => {
    setResultLoaded(true);
  }, [updatedQuestions]);

  const generatePDF = () => {
    setLoading(true);
    const svgRef = hiddenSvgRef.current;
    if (svgRef) {
      html2canvas(svgRef, { scale: 1, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/svg+xml");

          const pdf = new jsPDF({
            unit: "px",
            format: [816, 1056],
          });

          const imgProps = pdf.getImageProperties(imgData);
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgRatio = imgHeight / imgWidth;
          const pdfRatio = pdfHeight / pdfWidth;
          const margin = 10;
          const lineHeight = 10;
          let imgHeightInPdf;
          let imgWidthInPdf;

          if (imgRatio > pdfRatio) {
            imgHeightInPdf = pdfHeight;
            imgWidthInPdf = pdfHeight / imgRatio;
          } else {
            imgHeightInPdf = pdfWidth * imgRatio;
            imgWidthInPdf = pdfWidth;
          }
          pdf.addImage(
            imgData,
            "SVG",
            margin,
            0,
            pdfWidth - 2 * margin,
            imgHeightInPdf
          );

          let currentY = imgHeightInPdf + margin;

          const renderSection = (title, questions) => {
            pdf.setFont(undefined, "bold");
            pdf.setFontSize(16);
            pdf.text(title, margin, currentY);
            currentY += lineHeight * 2;
            pdf.setFont(undefined, "normal");
            pdf.setFontSize(12);

            questions.forEach((q, index) => {
              const question = q.text + " ";
              const answer = q.answer_text;
              const fullText = question + answer;

              const fullTextLines = pdf.splitTextToSize(
                fullText,
                pdfWidth - 2 * margin
              );

              if (fullTextLines.length == 1) {
                if (currentY + lineHeight > pdfHeight - margin) {
                  pdf.addPage();
                  currentY = margin;
                }
                pdf.text(question, margin, currentY);
                pdf.setFont(undefined, "bold");
                pdf.text(answer, margin + pdf.getTextWidth(question), currentY);
                pdf.setFont(undefined, "normal");
                currentY += lineHeight;
              } else {
                const questionLines = pdf.splitTextToSize(
                  question,
                  pdfWidth - 2 * margin
                );
                questionLines.forEach((line) => {
                  if (currentY + lineHeight > pdfHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                  }
                  pdf.text(line, margin, currentY);
                  currentY += lineHeight;
                });

                const answerLines = pdf.splitTextToSize(
                  q.answer_text,
                  pdfWidth - 2 * margin
                );
                pdf.setFont(undefined, "bold");
                answerLines.forEach((line) => {
                  if (currentY + lineHeight > pdfHeight - margin) {
                    pdf.addPage();
                    currentY = margin;
                  }
                  pdf.text(line, margin, currentY);
                  currentY += lineHeight;
                });
                try {
                  pdf.setFont(undefined, "normal");
                } catch (error) {
                  console.error("error setting font to normal", error);
                }
              }
              currentY += lineHeight;
            });
          };
          pdf.setFont(undefined, "bold");
          pdf.setFontSize(16);
          currentY += lineHeight * 2;
          pdf.text("Your Answers", pdfWidth / 2, currentY);
          currentY += lineHeight * 2;
          pdf.setFont(undefined, "normal");
          pdf.setFontSize(12);
          renderSection("Behavior questions", groupedQuestions["B"]);
          renderSection("Intellectual questions", groupedQuestions["I"]);
          renderSection("Technical questions", groupedQuestions["T"]);
          renderSection("Emotional questions", groupedQuestions["E"]);

          pdf.save("BITE_score.pdf", { returnPromise: true });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  const calculateWrappedTextHeight = (text, maxWidth, lineHeight, num) => {
    const words = text.split(" ");
    let currentLine = "";
    let lineCount = 1;

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = getTextWidth(testLine, "16px Roboto");
      if (testWidth > maxWidth) {
        lineCount++;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    const deltaHeight = lineCount * lineHeight;
    return deltaHeight;
  };

  const getTextWidth = (text, font) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  <Accordion></Accordion>;

  const Section = ({ title, questions }) => (
    <>
     
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2-content"
          id="panel2-header"
        >
          <h2 className="question-section-h2">{title}</h2>
        </AccordionSummary>
        <AccordionDetails>
          <div className="question-section">
            {questions.map((q, index) => (
              <div key={q.num} className="question-container">
                <p className="question-text">{q.text}</p>
                <strong className="answer-text">
                  {q.answer_text ? q.answer_text : "No answer"}
                </strong>
              </div>
            ))}
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );

  return (
    <div className="results-container">
      <div className="report-controls" ref={reportControlsRef}>
        <div className="separator"></div>
        <section className="results">
          <ShareComponent />
        </section>
        <div className="report-links-container">
          <button className="report-link" onClick={generatePDF}>
            {loading ? "Generating..." : "Download Your Scores as PDF"}
          </button>
          <button className="report-link" onClick={() => navigate("/")}>
            Back to Survey
          </button>
        </div>
        <div className="separator"></div>
      </div>
      <div className="scrollable-content">
        <PDFGenerator
          content={
            <SVGContainer
              key={JSON.stringify(updatedQuestions)}
              svgWidth={divWidth - 15}
              bite_score={biteScore}
              questions={updatedQuestions}
              answers={answers}
              textResponses={textResponses}
              pdf={false}
            />
          }
          loading={loading}
          ref={svgContainerRef}
        />
        {/* <div className="answer-container">
          <p>
            <strong>Behavior questions</strong>
          </p>
          {groupedQuestions["B"].map((q, index) => (
            <div key={q.num}>
              {q.text}
              <strong> {q.answer_text ? q.answer_text : " No answer"}</strong>
            </div>
          ))}
          <p>
            <strong>Information questions</strong>
          </p>
          {groupedQuestions["I"].map((q, index) => (
            <div key={q.num}>
              {q.text}
              <strong> {q.answer_text ? q.answer_text : " No answer"}</strong>
            </div>
          ))}
          <p>
            <strong>Thought questions</strong>
          </p>
          {groupedQuestions["T"].map((q, index) => (
            <div key={q.num}>
              {q.text}
              <strong> {q.answer_text ? q.answer_text : " No answer"}</strong>
            </div>
          ))}
          <p>
            <strong>Emotion questions</strong>
          </p>
          {groupedQuestions["E"].map((q, index) => (
            <div key={q.num}>
              {q.text}
              <strong> {q.answer_text ? q.answer_text : " No answer"}</strong>
            </div>
          ))}
        </div> */}
        <div className="results-wrapper">
          <div className="answer-container">
            <div className="answer-title">
            Your Answers
            </div>
            <Section
              title="Behavior Questions"
              questions={groupedQuestions["B"]}
            />
            <Section
              title="Information Questions"
              questions={groupedQuestions["I"]}
            />
            <Section
              title="Thought Questions"
              questions={groupedQuestions["T"]}
            />
            <Section
              title="Emotion Questions"
              questions={groupedQuestions["E"]}
            />
          </div>
          {/* <div>
            <img
              class="card__img-desktop"
              src="https://raw.githubusercontent.com/MizAndhre/FAQ-accordion-card/2ff2a02d093554f14d0390a409e825669313a16e/images/illustration-woman-online-desktop.svg"
              alt="Woman online desktop"
            />
          </div> */}
        </div>
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <PDFGenerator
            content={
              <SVGContainer
                key={JSON.stringify(updatedQuestions)}
                svgWidth={768}
                bite_score={biteScore}
                questions={updatedQuestions}
                answers={answers}
                textResponses={textResponses}
                pdf={true}
              />
            }
            ref={hiddenSvgRef}
          />
        </div>
      </div>
    </div>
  );
};

export default Results;
