import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import React, { useRef, useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import AnswerClass from './AnswerClass.js'; 
import {DoubleArrowClass, SingleArrow} from './Arrows.js'; 
import './SVGContainer.css'; 
import { destructiveColor, yellowOrange, constructiveColor, panelblue, darkblue, normalText, titleText } from './colors.js';



const PieChart = ({ greenSize, orangeSize, x, y, radius }) => {

 if (Number.isNaN(greenSize)) {
   return ;
 }
  const total = greenSize + orangeSize;
  const greenAngle = (greenSize / total) * 360;
  const orangeAngle = (orangeSize / total) * 360;

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
        d={`M 0 0 L ${greenX} ${greenY} A ${radius} ${radius} 0 ${1 - largeArcFlag} 1 ${radius} 0 Z`}
        fill={destructiveColor}
      />
    </g>
  );
};
const hexToRgb = (hex) => {
  hex = hex.replace(/^#/, '');
  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;
  return [r, g, b];
};

const interpolateColor = (color1, color2, factor=0.5) => {
  let result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
};

const rgbToHex = (rgb) => {
  const hex = (num) => {
    let hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${hex(rgb[0])}${hex(rgb[1])}${hex(rgb[2])}`;
};

const getGradientColor = (factor) => {

  const startRgb = hexToRgb(constructiveColor);
  const endRgb = hexToRgb(yellowOrange);
  const interpolatedRgb = interpolateColor(startRgb, endRgb, factor);
  return rgbToHex(interpolatedRgb);
};

function SVGContainer( {svgWidth, bite_score, questions, answers, textResponses, pdf}) {
    const navigate = useNavigate();
    const svgRef = useRef(null);
    const [svgHeight, setSvgHeight] = useState(660);
    const lineSpacing = 20; // Space between each line
    const startarrowx = 10;
    const startarrowy = 130;
    const arrow_width = 40;  // double arrow head size
    const end_arrow_offset = 10
    const [robotoRegularBase64, setRobotoRegularBase64] = useState('');
    const [robotoBoldBase64, setRobotoBoldBase64] = useState('');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [updatedQuestions, setUpdatedQuestions] = useState([]);
    const [isDataLoaded,  setIsDataLoaded] = useState(false);
    const [groupedQuestions, setGroupedQuestions] = useState({
        B: [], I: [], T: [], E: [], D: []
    });
    const fullHeight = pdf ? 670 : 570 ;
    const [currentY, setCurrentY] = useState(fullHeight+100);
    const [sections, setSections] = useState({
        behavior: null,
        information: null,
        thought: null,
        emotion: null,
        demographics: null
    });
    const categoryMap = {
      B: 'Behavior',
      I: 'Information',
      T: 'Thought',
      E: 'Emotion',
      D: 'Demographics',
    };

/*    const groupedQuestions = {
        B: [], I: [], T: [], E: [], D: []
    };*/

    useEffect(() => {
       const answersArray = Object.values(answers);
       if (Array.isArray(answersArray) && answersArray.length > 1) {
           const updatedQuestionsList = questions.map((question,qindex) => {
                   if (question.answer_text.length < 1) {
                       console.log("missing answer_text",question);
                       const matchingAnswer = answersArray.find(answer => answer.question_id === question.num);
                       if (question.num===72) console.log('qq',question, matchingAnswer);
                       if (question.num===72) console.log('svg qq',question, 'a:',matchingAnswer.answer_text, "match",matchingAnswer);
                       if (matchingAnswer) {
                            let validOptions = [];
                            try {
                              validOptions = JSON.parse(question.valid);
                            } catch (e) {
                              console.error("Error parsing valid options for question", question.num, e);
                            }
                            let answerText = '';
                            if (question.ftype === 'Numeric' && validOptions.length > 0) { 
                                answerText = validOptions[answers[qindex+1]?.answer_id-1] || '';
                            }
                            else if (question.ftype === 'String') {
                                answerText = textResponses?.find(item => item.question_id === question.num)?.answer_other || '';
                            }
                           //if (question.num===53) console.log('report qq',question);
                          return { ...question, height: question.height, answer_id: matchingAnswer.answer_id, answer_text:answerText  };
                       }
                   } else {
                       return question;
                   }
                   return null;
               })
               .filter(question => question !== null); 

               const newGroupedQuestions = {
                   B: [], I: [], T: [], E: [], D: []
               };
       
               updatedQuestionsList.forEach((question) => {
                   newGroupedQuestions[question.category].push(question);
               });
               //console.log("grouped report ", newGroupedQuestions);
               setGroupedQuestions(newGroupedQuestions);
               setUpdatedQuestions(updatedQuestionsList);
               console.log('set svg height ',svgHeight);
               setSvgHeight(svgHeight); // + 20*updatedQuestionsList.length); // TODO check THIS IS WRONG!!
               setIsDataLoaded(true);
               //console.log('height report ',updatedQuestionsList);
       }
    }, [answers, questions, textResponses]);


    useEffect(() => {
      const fetchFont = async (url) => {
        const response = await fetch(url);
        const text = await response.text();
        return text.trim();
      };

      const loadFonts = async () => {
        const regularFont = await fetchFont('/static/Roboto-Regular.base64.txt');
        const boldFont = await fetchFont('/static/Roboto-Bold.base64.txt');
        setRobotoRegularBase64(regularFont);
        setRobotoBoldBase64(boldFont);
      };

      loadFonts();
    }, []);


    useEffect(() => {
      if (svgRef.current) {
        const width = svgRef.current.getBoundingClientRect().width;
        //setSvgHeight(615);
        //console.log("width", width, "endarrow =",endarrow,"endtext",endtext); // Log it or set state here
        const handleResize = () => {
            const width = svgRef.current.getBoundingClientRect().width;
            const endarrow = width - end_arrow_offset; // Calculate endx based on the SVG's width
            const endtext = width - 20; // Calculate endx based on the SVG's width
            console.log("Resize: width", width, "endarrow =",endarrow,"endtext",endtext); // Log it or set state here
        };

        // Add the event listener for resize on component mount
        window.addEventListener('resize', handleResize);

        // Call the handler right away so state gets updated with initial window size
        handleResize();

        // Return a cleanup function to remove the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
      }
    }, []); // Empty dependency array means this runs once after initial render

    /* useEffect(() => {
      setIsDataLoaded(true);
    const renderCategorySection = (category, header, currentY) => {
        const questions = groupedQuestions[category];
        const sectionY = currentY;
        if (questions.length === 0) {
            return {
              section: (
                  <text x={svgWidth / 2} y={sectionY} textAnchor="middle" style={{ fontWeight: 700, fontSize: "clamp(16px, 3vw, 32px)" }} fill="black">
                  
                    No {categoryMap[category]} questions
                  </text>
              ),
              nextY: sectionY + 40
            };
        }
        const sectionHeight = calculateSectionHeight(questions, svgWidth);
        let section = [];
        let y = currentY + lineSpacing*2;
        console.log('report render section Height',sectionHeight, 'cat:',category, 'at',currentY, 'count',questions.length, questions);
        questions.forEach((question) => {
            let answer_text = question.answer_id.toString();
            if (question.answer_text.length > 1) {
                answer_text = question.answer_text;
            }
            if (question.category === category) {
                    section.push({
                        'text':question.text,
                        'height':question.height,
                        'y':y,
                        'answer_text':answer_text
                    })
                    y = y + question.height;
            }
        });

        return {
          section: (
            <>
              <text x={svgWidth / 2} y={sectionY} textAnchor="middle" style={{ fontWeight: 700, fontSize: "clamp(16px, 3vw, 32px)" }} fill="black">
              
                {header}
              </text>
              {section.map((question, qIndex) => (
                <AnswerClass
                  key={qIndex}
                  question={question.text}
                  answer={question.answer_text}
                  category={category}
                  currentY={question.y}
                  height={question.height}
                  svgWidth={svgWidth}
                />
              ))}
            </>
          ),
          nextY: sectionY + sectionHeight + 40
        };
      };

      let newCurrentY = fullHeight+100;

      const behaviorSection = renderCategorySection('B', 'Behavior Questions', newCurrentY);
      newCurrentY = behaviorSection.nextY;

        const informationSection = renderCategorySection('I', 'Information Questions', newCurrentY);
        newCurrentY = informationSection.nextY;

        const thoughtSection = renderCategorySection('T', 'Thought Questions', newCurrentY);
        newCurrentY = thoughtSection.nextY;

        const emotionSection = renderCategorySection('E', 'Emotion Questions', newCurrentY);
        newCurrentY = emotionSection.nextY;

        const demographicsSection = renderCategorySection('D', 'Demographics Questions', newCurrentY);
        newCurrentY = demographicsSection.nextY;

        setSections({
            behavior: behaviorSection.section,
            information: informationSection.section,
            thought: thoughtSection.section,
            emotion: emotionSection.section,
            demographics: demographicsSection.section
        });

        setCurrentY(newCurrentY);
    }, [groupedQuestions]);*/
      

    if (!isDataLoaded) {
        return <div>Loading...</div>;
    }

    const influenceContinuumItems = [
      ["Authentic identity", "False Identity"],
      ["Unconditional Love", "Conditional Love"],
      ["Compassion", "Hate"],
      ["Conscience", "Doctrine"],
      ["Creativity and Humor", "Fear and Guilt"],
      ["Free Will / Critical Thinking", "Blind Obedience"],
        ["",""],
        ["Psychologically Healthy","Narcissistic"],
        ["Knows Own Limits","Elitist"],
        ["Empowers Individuals","Power Hungry"],
        ["Trustworthy","Secretive / Deceptive"],
        ["Accountable","Claims Absolute Authority"],
        ["",""],
        ["Checks and Balances","Authoritarian Structure"],
        ["Informed Consent","Deceptive / Manipulative"],
        ["Individuality","Clones People"],
        ["Means Create Ends","Ends Justify Means"],
        ["Encourages Growth", "Preserves Own Power"],
        ["Free to Leave", "No Legitimate Reason to Leave"],
        ["Egalitarianism","Elitism"],
    ];



  const calculateSectionHeight = (questions, width) => {
    const betweenlineSpacing = 1;
    //const maxWidth = width - 50;
    let totalHeight = 0;

    questions.forEach(question => {
      totalHeight += question.height + betweenlineSpacing;
      //if (question.num === 28)
      //  console.log("section",question.category, totalHeight);
      //const text = `${question.text} ${question.answer_text}`;
      //totalHeight += calculateWrappedTextHeight(text, maxWidth, lineSpacing) + lineSpacing;
    });

    return totalHeight;
  };

/*      const behaviorSection = renderCategorySection('B', 'Behavior Questions', currentY);
      currentY = behaviorSection.nextY;

      const informationSection = renderCategorySection('I', 'Information Questions', currentY);
      currentY = informationSection.nextY;

      const thoughtSection = renderCategorySection('T', 'Thought Questions', currentY);
      currentY = thoughtSection.nextY;

      const emotionSection = renderCategorySection('E', 'Emotion Questions', currentY);
      currentY = emotionSection.nextY;

      const demographicsSection = renderCategorySection('D', 'Demographics Questions', currentY);
      currentY = demographicsSection.nextY;*/


      /*
    const downloadPng = (pngUrl) => {
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'BITEscore.png'; // Set the download filename
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    */

    const pieChartRadius = svgWidth > 600 ? 60 : 30;
    const pieChartSpacing = svgWidth / 5; // Divide the width by 5 for spacing
    const pieChartsY = 380; // Adjust this value based on where you want the charts to be positioned
    const panelWidth = svgWidth * 0.9;
    const panelHeight = 340;
    const panelX = (svgWidth - panelWidth) / 2;
    const panelY = pieChartsY - pieChartRadius - 100; // Adjust this value as needed
    const words = ['Behavior','Information','Thought','Emotion'];
    const legendY = pieChartsY + pieChartRadius + 10;
    const legendItems = [
        { color: constructiveColor, label: "Constructive" },
        { color: destructiveColor, label: "Destructive" },
    ];
    //const legendSpacing = svgWidth / (legendItems.length + 1); // Calculate the spacing for legend items
    const legendItemWidth = 50; // Estimated width of each legend item (box + text)
    const legendSpacing = (svgWidth - legendItems.length * legendItemWidth) / (legendItems.length + 1);
    //const lineSpacing = 25; /* space between lines on legend */

    const imageWidth = 120;
    const imageHeight = 120;
    const imageX = svgWidth - imageWidth - 40; // pixels from the right edge
    const imageY = fullHeight - imageHeight + 100;



    if (!robotoRegularBase64 || !robotoBoldBase64) {
        return <div>Loading fonts...</div>;
    }

    return (
    <>
      <div className="svg-wrapper" style={{ width: svgWidth, height: svgHeight, overflow: 'hidden' }}>
      <svg ref={svgRef} height={svgHeight}  viewBox={`0 0 ${svgWidth} ${svgHeight}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            {!isGeneratingPdf && (
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="lightblue" stopOpacity="1" />
                <stop offset="100%" stopColor={destructiveColor} stopOpacity="1" />
              </linearGradient>
            )}
            {!isGeneratingPdf && (
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={constructiveColor} stopOpacity="1" />
                <stop offset="100%" stopColor={destructiveColor} stopOpacity="1" />
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
            fill={isGeneratingPdf ? "#0F4776": "#0F4776"}
            width={svgWidth}
          />
            <text x={svgWidth / 2}  y="65" textAnchor="middle" className="influenceTitle"> 
              AM I IN A CULT ? 
            </text>
            <text x={svgWidth / 2}  y="90" fill={normalText} textAnchor="middle" > 
              GROUP | RELATIONSHIP HEALTH METER
            </text>
            <text x="20" y={startarrowy-20} className="influenceGood"> 
              Constructive
            </text>
            <text x={svgWidth-30} y={startarrowy-20} textAnchor="end" className="influenceBad"> 
              Destructive
            </text>
            <DoubleArrowClass startx={startarrowx} endx={svgWidth-end_arrow_offset} starty={startarrowy} arrowHeadLength={40} color={isGeneratingPdf ? "orange" : "url(#greenGradient)"} />

            <ScoreComponent score={bite_score[0]} starty={startarrowy+5} arrowHeight={31} svgWidth={svgWidth} min={startarrowx+arrow_width} max={svgWidth-arrow_width-end_arrow_offset}/>
            <defs>
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="steelblue" stopOpacity="1" />
                  <stop offset="100%" stopColor="yellow" stopOpacity="1" />
                </linearGradient>


            </defs>
          {/* Blue panel behind the pie charts */}
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
              y={panelY + 40} // Adjust this value based on where you want the text
              textAnchor="middle"
              style={{ fontWeight: 700, fontSize: svgWidth < 500? '4vw' : 'clamp(16px, 3vw, 32px)' }}
            >
              <tspan fill={titleText}>Level of Control - The BITE Model <tspan dy="-0.3em" fontSize="75%">&#8482;</tspan></tspan>
            </text>
         {/* Words above pie charts */}
          {words.map((word, index) => (
            <text
              key={index}
              x={pieChartSpacing * (index + 1)}
              y={panelY + 80} // Adjust this value based on where you want the text
              textAnchor="middle"
              style={{ fontWeight: 700, fontSize: svgWidth < 500? '3.5vw' : 'clamp(16px, 3vw, 32px)' }}
            >
              <tspan fill={titleText}>{word[0]}</tspan>
              <tspan fill={normalText}>{word.slice(1)}</tspan>
            </text>
          ))}

          <PieChart greenSize={100-bite_score[1]} orangeSize={bite_score[1]} x={pieChartSpacing * 1} y={pieChartsY} radius={pieChartRadius} />
          <PieChart greenSize={100-bite_score[2]} orangeSize={bite_score[2]} x={pieChartSpacing * 2} y={pieChartsY} radius={pieChartRadius} />
          <PieChart greenSize={100-bite_score[3]} orangeSize={bite_score[3]} x={pieChartSpacing * 3} y={pieChartsY} radius={pieChartRadius} />
          <PieChart greenSize={100-bite_score[4]} orangeSize={bite_score[4]} x={pieChartSpacing * 4} y={pieChartsY} radius={pieChartRadius} /> 
         {/* Legend */}
          {legendItems.map((item, index) => (
            <g
              key={index}
              transform={`translate(${0}, ${legendY + (index * lineSpacing * 1.3)})`}
            >
              <rect x={svgWidth/2-legendItemWidth} y="0" width="20" height="20" fill={item.color} />
              <text x={svgWidth/2+40-legendItemWidth} y="15" fontSize="24" fill={normalText}>{item.label}</text>
            </g>
          ))}
          {pdf ? (
              <>
            <text x={svgWidth / 2}  y={panelY+panelHeight+30} fill="white" textAnchor="middle" 
              style={{ fontWeight: 400, fontSize: svgWidth < 500? '2vw' : 'clamp(16px, 3vw, 32px)' }}> 
              Any healthy group/relationship can withstand scrutiny.
            </text>
            <text x={svgWidth / 2}  y={panelY+panelHeight+65} fill="white" textAnchor="middle" 
              style={{ fontWeight: 400, fontSize: "24px" }}> 
              Find out how yours measures up at <tspan fill={titleText}>bitemodel.com</tspan>
            </text>
              </>
          ) : (<></>)
          }
            <text x={panelX+20}  y={fullHeight-20} fill="lightblue" 
              style={{ fontWeight: 400, fontSize: svgWidth < 500? '3vw' : 'clamp(16px, 3vw, 32px)' }}> 
              Powered by BITE Model<tspan dy="-0.3em" fontSize="75%">&#8482;</tspan><tspan dy="+0.22em"> and Influence Continuum<tspan dy="-0.3em" fontSize="75%">&#8482;</tspan></tspan> 
            </text>
            <image
              x={imageX}
              y={imageY}
              width={imageWidth}
              height={imageHeight}
              href="/static/logo512.png"
            />
        {svgWidth < 500 ?  ( 
            <>
            <tspan x={svgWidth / 2} dy="0" > Are you in an unhealthy group </tspan>
            <tspan x={svgWidth / 2} dy="1.0em" >or controlling relationship? </tspan>
            <tspan x={svgWidth / 2} dy="1.5em" >Find out now:
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
            <tspan>Are you in an unhealthy group or controlling relationship?</tspan>
            <tspan x={svgWidth / 2} dy="1.2em" >Find out now:
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
            <text 
                x={svgWidth / 2}  
                y={fullHeight+60}
                textAnchor="middle" 
                style={{
                    fontWeight:700, 
                    fontSize: svgWidth < 500? '6vw' : 'clamp(16px, 3vw, 32px)'
                }} 
                fill="black"
            > 
               Your Answers 
            </text>
            {sections.behavior}
            {sections.information}
            {sections.thought}
            {sections.emotion}
            {sections.demographics}

          </svg>
      </div>
      </>
        )
  };

  const InfluenceClass = ({ text, textBad, index, svgWidth,lineSpacing }) => {
        const startY = 175; // Initial Y position for the first text item
        const yPosition = startY + index * lineSpacing;
      
        return (
            <>
              {/* Bullet */}
              <rect x="5" y={yPosition - 10} width="10" height="10" fill={text.length> 2 ? "lightblue":"white"} />
              {/* Text */}
              <text x="20" y={yPosition} fill="white" className="influenceTextGood"
                cursor="pointer" onClick={() => handleInfluenceClick(text)}>
            {text}
            </text>
              <text textAnchor="end" x={svgWidth - 25} y={yPosition} fill="white" className="influenceTextBad" 
                cursor="pointer" onClick={() => handleInfluenceClick(text)} >
            {textBad}
            </text>
              <rect x={svgWidth - 15} y={yPosition - 10} width="10" height="10" fill={text.length> 1 ? "orange":"white"}  />
            </>
          );
    };
    function ScoreComponent( {score, svgWidth, starty, arrowHeight, min, max} ) {
        return (
            <>
            {(score === undefined || Number.isNaN(score) || score < 0)? (
               <text x="120" y="170" fill="pink" style={{fontWeight:700, fontSize:"16px"}}>Please go back to the survey and complete at least 40 questions to get a score</text>
            ): (
            <>
              <SingleArrow score={score} starty={starty}  min={0} max={svgWidth}
                svgWidth={svgWidth} arrowWidth={70} arrowHeight={60} strokeWidth={8} color={getGradientColor(score/100)} />
            </>
            ) }
            </>
        );
    }

    const handleInfluenceClick = (text) => {
        console.log("click", text)
    };
export default SVGContainer;
