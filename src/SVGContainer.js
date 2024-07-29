import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoubleArrowClass, SingleArrow } from "./Arrows.js";
import "./SVGContainer.css";
import {
  destructiveColor,
  yellowOrange,
  constructiveColor,
  panelblue,
  normalText,
  titleText,
} from "./colors.js";

const PieChart = ({ greenSize, orangeSize, x, y, radius }) => {
  if (Number.isNaN(greenSize)) {
    return;
  }
  const total = greenSize + orangeSize;
  const greenAngle = (greenSize / total) * 360;

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent) * radius;
    const y = Math.sin(2 * Math.PI * percent) * radius;
    return [x, y];
  };

  const [greenX, greenY] = getCoordinatesForPercent(greenSize / total);
  const largeArcFlag = greenAngle > 180 ? 1 : 0;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d={`M 0 0 L ${radius} 0 A ${radius} ${radius} 0 ${largeArcFlag} 1 ${greenX} ${greenY} Z`}
        fill={constructiveColor}
      />
      <path
        d={`M 0 0 L ${greenX} ${greenY} A ${radius} ${radius} 0 ${
          1 - largeArcFlag
        } 1 ${radius} 0 Z`}
        fill={destructiveColor}
      />
    </g>
  );
};
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, "");
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b];
};

const interpolateColor = (color1, color2, factor = 0.5) => {
  let result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};

const rgbToHex = (rgb) => {
  const hex = (num) => {
    let hex = num.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
};

const getGradientColor = (factor) => {
  const startRgb = hexToRgb(constructiveColor);
  const endRgb = hexToRgb(yellowOrange);
  const interpolatedRgb = interpolateColor(startRgb, endRgb, factor);
  return rgbToHex(interpolatedRgb);
};

function SVGContainer({
  svgWidth,
  bite_score,
  questions,
  answers,
  textResponses,
  pdf,
}) {
  const svgRef = useRef(null);
  const [svgHeight, setSvgHeight] = useState(660);
  const lineSpacing = 20;
  const startarrowx = 10;
  const startarrowy = 130;
  const arrow_width = 40;
  const end_arrow_offset = 10;
  const [robotoRegularBase64, setRobotoRegularBase64] = useState("");
  const [robotoBoldBase64, setRobotoBoldBase64] = useState("");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [updatedQuestions, setUpdatedQuestions] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [groupedQuestions, setGroupedQuestions] = useState({
    B: [],
    I: [],
    T: [],
    E: [],
    D: [],
  });
  const fullHeight = pdf ? 670 : 570;
  const [sections, setSections] = useState({
    behavior: null,
    information: null,
    thought: null,
    emotion: null,
    demographics: null,
  });

  useEffect(() => {
    const answersArray = Object.values(answers);
    if (Array.isArray(answersArray) && answersArray.length > 1) {
      const updatedQuestionsList = questions
        .map((question, qindex) => {
          if (question.answer_text.length < 1) {
            const matchingAnswer = answersArray.find(
              (answer) => answer.question_id === question.num
            );
            if (question.num === 72)
              if (question.num === 72)
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
                    answerText =
                      validOptions[answers[qindex + 1]?.answer_id - 1] || "";
                  } else if (question.ftype === "String") {
                    answerText =
                      textResponses?.find(
                        (item) => item.question_id === question.num
                      )?.answer_other || "";
                  }
                  return {
                    ...question,
                    height: question.height,
                    answer_id: matchingAnswer.answer_id,
                    answer_text: answerText,
                  };
                }
          } else {
            return question;
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

      updatedQuestionsList.forEach((question) => {
        newGroupedQuestions[question.category].push(question);
      });
      setGroupedQuestions(newGroupedQuestions);
      setUpdatedQuestions(updatedQuestionsList);
      setSvgHeight(svgHeight);
      setIsDataLoaded(true);
    }
  }, [answers, questions, textResponses]);

  useEffect(() => {
    const fetchFont = async (url) => {
      const response = await fetch(url);
      const text = await response.text();
      return text.trim();
    };

    const loadFonts = async () => {
      const regularFont = await fetchFont("/static/Roboto-Regular.base64.txt");
      const boldFont = await fetchFont("/static/Roboto-Bold.base64.txt");
      setRobotoRegularBase64(regularFont);
      setRobotoBoldBase64(boldFont);
    };

    loadFonts();
  }, []);

  useEffect(() => {
    if (svgRef.current) {
      const width = svgRef.current.getBoundingClientRect().width;
      const handleResize = () => {
        const width = svgRef.current.getBoundingClientRect().width;
        const endarrow = width - end_arrow_offset;
        const endtext = width - 20;
      };

      window.addEventListener("resize", handleResize);

      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  if (!isDataLoaded) {
    return <div>Loading...</div>;
  }

  const pieChartRadius = svgWidth > 600 ? 60 : 30;
  const pieChartSpacing = svgWidth / 5;
  const pieChartsY = 380;
  const panelWidth = svgWidth * 0.9;
  const panelHeight = 340;
  const panelX = (svgWidth - panelWidth) / 2;
  const panelY = pieChartsY - pieChartRadius - 100;
  const words = ["Behavior", "Information", "Thought", "Emotion"];
  const legendY = pieChartsY + pieChartRadius + 10;
  const legendItems = [
    { color: constructiveColor, label: "Constructive" },
    { color: destructiveColor, label: "Destructive" },
  ];
  const legendItemWidth = 50;

  const imageWidth = 120;
  const imageHeight = 120;
  const imageX = svgWidth - imageWidth - 40;
  const imageY = fullHeight - imageHeight + 100;

  if (!robotoRegularBase64 || !robotoBoldBase64) {
    return <div>Loading fonts...</div>;
  }

  return (
    <>
      <div
        className="svg-wrapper"
        style={{ width: svgWidth, height: svgHeight, overflow: "hidden" }}
      >
        <svg
          ref={svgRef}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {!isGeneratingPdf && (
              <linearGradient
                id="blueGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="lightblue" stopOpacity="1" />
                <stop
                  offset="100%"
                  stopColor={destructiveColor}
                  stopOpacity="1"
                />
              </linearGradient>
            )}
            {!isGeneratingPdf && (
              <linearGradient
                id="greenGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop
                  offset="0%"
                  stopColor={constructiveColor}
                  stopOpacity="1"
                />
                <stop
                  offset="100%"
                  stopColor={destructiveColor}
                  stopOpacity="1"
                />
              </linearGradient>
            )}
          </defs>
          <style>
            {`
                @font-face {
                  font-family: 'Roboto';
                  src: url(data:font/truetype;charset=utf-8;base64,${robotoRegularBase64}) format('truetype');
                  font-weight: normal;
                  font-style: normal;
                }
                @font-face {
                  font-family: 'Roboto';
                  src: url(data:font/truetype;charset=utf-8;base64,${robotoBoldBase64}) format('truetype');
                  font-weight: bold;
                  font-style: normal;
                }
                .influenceTitle {
                  font-family: 'Roboto', sans-serif;
                }
                .influenceGood {
                  font-family: 'Roboto', sans-serif;
                }
                .influenceBad {
                  font-family: 'Roboto', sans-serif;
                }
              `}
          </style>
          <rect
            x="0"
            y="20"
            height={fullHeight}
            fill={isGeneratingPdf ? "#0F4776" : "#0F4776"}
            width={svgWidth}
          />
          <text
            x={svgWidth / 2}
            y="65"
            textAnchor="middle"
            className="influenceTitle"
          >
            AM I IN A CULT ?
          </text>
          <text x={svgWidth / 2} y="90" fill={normalText} textAnchor="middle">
            GROUP | RELATIONSHIP HEALTH METER
          </text>
          <text x="20" y={startarrowy - 20} className="influenceGood">
            Constructive
          </text>
          <text
            x={svgWidth - 30}
            y={startarrowy - 20}
            textAnchor="end"
            className="influenceBad"
          >
            Destructive
          </text>
          <DoubleArrowClass
            startx={startarrowx}
            endx={svgWidth - end_arrow_offset}
            starty={startarrowy}
            arrowHeadLength={40}
            color={isGeneratingPdf ? "orange" : "url(#greenGradient)"}
          />

          <ScoreComponent
            score={bite_score[0]}
            starty={startarrowy + 5}
            arrowHeight={31}
            svgWidth={svgWidth}
            min={startarrowx + arrow_width}
            max={svgWidth - arrow_width - end_arrow_offset}
          />
          <defs>
            <linearGradient
              id="arrowGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="steelblue" stopOpacity="1" />
              <stop offset="100%" stopColor="yellow" stopOpacity="1" />
            </linearGradient>
          </defs>
          <rect
            x={panelX}
            y={panelY}
            width={panelWidth}
            height={panelHeight}
            fill={panelblue}
            rx="25"
            ry="25"
          />
          <text
            x={svgWidth / 2}
            y={panelY + 40}
            textAnchor="middle"
            style={{
              fontWeight: 700,
              fontSize: svgWidth < 500 ? "4vw" : "clamp(16px, 3vw, 32px)",
            }}
          >
            <tspan fill={titleText}>
              Level of Control - The BITE Model{" "}
              <tspan dy="-0.3em" fontSize="75%">
                &#8482;
              </tspan>
            </tspan>
          </text>
          {words.map((word, index) => (
            <text
              key={index}
              x={pieChartSpacing * (index + 1)}
              y={panelY + 80}
              textAnchor="middle"
              style={{
                fontWeight: 700,
                fontSize: svgWidth < 500 ? "3.5vw" : "clamp(16px, 3vw, 32px)",
              }}
            >
              <tspan fill={titleText}>{word[0]}</tspan>
              <tspan fill={normalText}>{word.slice(1)}</tspan>
            </text>
          ))}

          <PieChart
            greenSize={100 - bite_score[1]}
            orangeSize={bite_score[1]}
            x={pieChartSpacing * 1}
            y={pieChartsY}
            radius={pieChartRadius}
          />
          <PieChart
            greenSize={100 - bite_score[2]}
            orangeSize={bite_score[2]}
            x={pieChartSpacing * 2}
            y={pieChartsY}
            radius={pieChartRadius}
          />
          <PieChart
            greenSize={100 - bite_score[3]}
            orangeSize={bite_score[3]}
            x={pieChartSpacing * 3}
            y={pieChartsY}
            radius={pieChartRadius}
          />
          <PieChart
            greenSize={100 - bite_score[4]}
            orangeSize={bite_score[4]}
            x={pieChartSpacing * 4}
            y={pieChartsY}
            radius={pieChartRadius}
          />
          {legendItems.map((item, index) => (
            <g
              key={index}
              transform={`translate(${0}, ${
                legendY + index * lineSpacing * 1.3
              })`}
            >
              <rect
                x={svgWidth / 2 - legendItemWidth}
                y="0"
                width="20"
                height="20"
                fill={item.color}
              />
              <text
                x={svgWidth / 2 + 40 - legendItemWidth}
                y="15"
                fontSize="24"
                fill={normalText}
              >
                {item.label}
              </text>
            </g>
          ))}
          {pdf ? (
            <>
              <text
                x={svgWidth / 2}
                y={panelY + panelHeight + 30}
                fill="white"
                textAnchor="middle"
                style={{
                  fontWeight: 400,
                  fontSize: svgWidth < 500 ? "2vw" : "clamp(16px, 3vw, 32px)",
                }}
              >
                Any healthy group/relationship can withstand scrutiny.
              </text>
              <text
                x={svgWidth / 2}
                y={panelY + panelHeight + 65}
                fill="white"
                textAnchor="middle"
                style={{ fontWeight: 400, fontSize: "24px" }}
              >
                Find out how yours measures up at{" "}
                <tspan fill={titleText}>bitemodel.com</tspan>
              </text>
            </>
          ) : (
            <></>
          )}
          <text
            x={panelX + 20}
            y={fullHeight - 20}
            fill="lightblue"
            style={{
              fontWeight: 400,
              fontSize: svgWidth < 500 ? "3vw" : "clamp(16px, 3vw, 32px)",
            }}
          >
            Powered by BITE Model
            <tspan dy="-0.3em" fontSize="75%">
              &#8482;
            </tspan>
            <tspan dy="+0.22em">
              {" "}
              and Influence Continuum
              <tspan dy="-0.3em" fontSize="75%">
                &#8482;
              </tspan>
            </tspan>
          </text>
          {/* <image
            x={imageX}
            y={imageY}
            width={imageWidth}
            height={imageHeight}
            href="/static/logo512.png"
          /> */}

          {svgWidth < 500 ? (
            <>
              <tspan x={svgWidth / 2} dy="0">
                {" "}
                Are you in an unhealthy group{" "}
              </tspan>
              <tspan x={svgWidth / 2} dy="1.0em">
                or controlling relationship?{" "}
              </tspan>
              <tspan x={svgWidth / 2} dy="1.5em">
                Find out now:
                <a
                  href="https://bitemodel.com"
                  className="influenceLink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bitemodel.com
                </a>
              </tspan>
            </>
          ) : (
            <>
              <tspan>
                Are you in an unhealthy group or controlling relationship?
              </tspan>
              <tspan x={svgWidth / 2} dy="1.2em">
                Find out now:
                <a
                  href="https://bitemodel.com"
                  className="influenceLink"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  bitemodel.com
                </a>
              </tspan>
            </>
          )}
          {/* <text
            x={svgWidth / 2}
            y={fullHeight + 60}
            textAnchor="middle"
            style={{
              fontWeight: 700,
              fontSize: svgWidth < 500 ? "6vw" : "clamp(16px, 3vw, 32px)",
            }}
            fill="black"
          >
            Your Answers
          </text> */}
          {sections.behavior}
          {sections.information}
          {sections.thought}
          {sections.emotion}
          {sections.demographics}
        </svg>
      </div>
    </>
  );
}

const InfluenceClass = ({ text, textBad, index, svgWidth, lineSpacing }) => {
  const startY = 175;
  const yPosition = startY + index * lineSpacing;

  return (
    <>
      <rect
        x="5"
        y={yPosition - 10}
        width="10"
        height="10"
        fill={text.length > 2 ? "lightblue" : "white"}
      />
      <text
        x="20"
        y={yPosition}
        fill="white"
        className="influenceTextGood"
        cursor="pointer"
        onClick={() => handleInfluenceClick(text)}
      >
        {text}
      </text>
      <text
        textAnchor="end"
        x={svgWidth - 25}
        y={yPosition}
        fill="white"
        className="influenceTextBad"
        cursor="pointer"
        onClick={() => handleInfluenceClick(text)}
      >
        {textBad}
      </text>
      <rect
        x={svgWidth - 15}
        y={yPosition - 10}
        width="10"
        height="10"
        fill={text.length > 1 ? "orange" : "white"}
      />
    </>
  );
};
function ScoreComponent({ score, svgWidth, starty }) {
  return (
    <>
      {score === undefined || Number.isNaN(score) || score < 0 ? (
        <text
          x="120"
          y="170"
          fill="pink"
          style={{ fontWeight: 700, fontSize: "16px" }}
        >
          Please go back to the survey and complete at least 40 questions to get
          a score
        </text>
      ) : (
        <>
          <SingleArrow
            score={score}
            starty={starty}
            min={0}
            max={svgWidth}
            svgWidth={svgWidth}
            arrowWidth={70}
            arrowHeight={60}
            strokeWidth={8}
            color={getGradientColor(score / 100)}
          />
        </>
      )}
    </>
  );
}

const handleInfluenceClick = (text) => {
};
export default SVGContainer;
