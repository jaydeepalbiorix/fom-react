import axios from 'axios';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import ShareComponent from './ShareComponent.js';
import SVGContainer from './SVGContainer.js';
import PDFGenerator from './PDFGenerator.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import './Results.css'; // Import your CSS for styling

const Results = ({ allQuestions, answers, textResponses, currentPage, totalPages, userUUID, questions, host_development, isHeaderSet }) => {
  const [endText, setEndText] = useState(0);
  const [biteScore, setBiteScore] = useState([]);
  //const [robotoRegularBase64, setRobotoRegularBase64] = useState('');
  //const [robotoBoldBase64, setRobotoBoldBase64] = useState('');
  //const [montserratRegularBase64, setMontserratRegularBase64] = useState('');
  //const [montserratBoldBase64, setMontserratBoldBase64] = useState('');
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
      B: [], I: [], T: [], E: [], D: []
  });

  useEffect(() => {
    const answersArray = Object.values(answers);
    if (Array.isArray(answersArray)) {
      if (answersArray.length > 1) {
        setDivWidth(400);
      }
    }
      console.log('answers',answers);
  }, [answers]);

  useEffect(() => {
    const updateDivWidth = () => {
      if (reportControlsRef.current) {
        //console.log("report width xyz", reportControlsRef.current.offsetWidth);
        setDivWidth(reportControlsRef.current.offsetWidth);
      }
    };

    updateDivWidth();

    window.addEventListener('resize', updateDivWidth);

    return () => {
      window.removeEventListener('resize', updateDivWidth);
    };
  }, []);

  useEffect(() => {
    if (reportControlsRef.current) {
      setDivWidth(reportControlsRef.current.offsetWidth);
      //console.log("report width xyz", reportControlsRef.current.offsetWidth);
    }
  }, [reportControlsRef.current]);

  // get score from backend
  const calculateScore = useCallback(async () => {
    if (userUUID && isHeaderSet) {
      try {
        console.log("call /get_score user", userUUID, "isHeaderSet", isHeaderSet);
        const response = await axios.get(`${host_development}/get_score/1`);
        const data = response.data;
        console.log(" got data ", data);
        const total = Math.round(data.find(answer => answer.category === 'total')['score'],0);
        const b_score = Math.round(data.find(answer => answer.category === 'B')['score'],0);
        const i_score = Math.round(data.find(answer => answer.category === 'I')['score'],0);
        const t_score = Math.round(data.find(answer => answer.category === 'T')['score'],0);
        const e_score = Math.round(data.find(answer => answer.category === 'E')['score'],0);
        //const score = Math.round(total, 0);
          console.log("scores",total, "B", b_score, "I", i_score, "T",t_score, "E",e_score);
        setBiteScore([total, b_score, i_score, t_score, e_score]);
      } catch (error) {
        if (error.response) {
          setLoading(false); // Ensure to stop loading in case of an error
          console.error("Backend returned an error:", error.response.data);
          console.error("Status code:", error.response.status);
          if (error.response.status === 400) {
            setLoading(false); // Ensure to stop loading in case of an error
            setBiteScore([-1]);
          }
        } else if (error.request) {
          setLoading(false); // Ensure to stop loading in case of an error
          console.error("No response received:", error.request);
        } else {
          setLoading(false); // Ensure to stop loading in case of an error
          console.error('Error', error.message);
        }
      }
    } else {
      console.log("score skipped header not set", isHeaderSet, "user", userUUID);
    }
  }, [host_development, userUUID, isHeaderSet]);

  useEffect(() => {
    calculateScore();
  }, [calculateScore]);

  /*useEffect(() => {
    console.log("bite_score:", biteScore);
  }, [biteScore]);*/

  const handleDone = () => {
    console.log("handleDone() calling calculateScore()");
    try {
      calculateScore();
    } catch (error) {
      console.log("error in count non zero", error);
    }
  };

/*
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
      const regularFont2 = await fetchFont('/static/Montserrat-Regular.base64.txt');
      const boldFont2 = await fetchFont('/static/Montserrat-Bold.base64.txt');
      setMontserratRegularBase64(regularFont2);
      setMontserratBoldBase64(boldFont2);
    };
    //load fonts at mount time
    loadFonts();
  }, []);
  */

  useEffect(() => {
    if (isDataLoaded && divWidth > 0) {
      let currentY = 700; // Initial Y position for the first text item
      const maxWidth = divWidth - 100; // Adjust as needed based on your layout
      const h = [];

      allQuestions.forEach((question) => {
        const text = `${question.text} ${question.answer_text}`;
        const textHeight = calculateWrappedTextHeight(text, maxWidth, 20, question.num);
        h.push({ num: question.num, height: textHeight, question: question.text });
        currentY += textHeight + 0; // Update Y position for the next question
      });

      setHeights(h);
    }
  }, [isDataLoaded, allQuestions, divWidth]);

  useEffect(() => {
   if (answers && textResponses) {
    const answersArray = Object.values(answers);
    if (Array.isArray(answersArray) && answersArray.length > 1) {
      const updatedQuestionsList = questions.map((question, qindex) => {
        const matchingAnswer = answersArray.find(answer => answer.question_id === question.num);
        if (matchingAnswer) {
          let validOptions = [];
          try {
            validOptions = JSON.parse(question.valid);
          } catch (e) {
            console.error("Error parsing valid options for question", question.num, e);
          }
          let answerText = '';
          if (question.ftype === 'Numeric' && validOptions.length > 0) {
            answerText = validOptions[(matchingAnswer.answer_id)-1];
          } else if (question.ftype === 'String') {
            answerText = textResponses?.find(item => item.question_id === question.num)?.answer_other || '';
          }
          const height = heights.find(h => h.num === question.num)?.height || 0;
          return { ...question, height, answer_id: matchingAnswer.answer_id, answer_text: answerText };
        }
        return null;
      }).filter(question => question !== null); 

      const newGroupedQuestions = {
          B: [], I: [], T: [], E: [], D: []
      };

      setUpdatedQuestions(updatedQuestionsList);
      updatedQuestionsList.forEach((question) => {
          newGroupedQuestions[question.category].push(question);
      });
      //console.log("grouped report ", newGroupedQuestions);
      setGroupedQuestions(newGroupedQuestions);
      setIsDataLoaded(true);
    }
   }
  }, [answers, questions, textResponses, heights]);

  useEffect(() => {
    console.log('grouped questions',groupedQuestions);
  }, [groupedQuestions]);

  useEffect(() => {
    setIsDataLoaded(true);
  }, [heights]);

  useEffect(() => {
    setResultLoaded(true);
      console.log('updatedQuestions',updatedQuestions);
  }, [updatedQuestions]);

  const generatePDF = () => {
    setLoading(true);
    const svgRef = hiddenSvgRef.current;
    if (svgRef) {
      console.log('call html2canvas');
      html2canvas(svgRef, { scale: 1, useCORS: true }).then(canvas => {
        console.log('canvas',canvas);
        const imgData = canvas.toDataURL('image/svg+xml');

        const pdf = new jsPDF({
          unit: 'px',
          format: [816, 1056], // 816 wide and height proportional to US letter at 96 ppi
        });
        //const pdf = new jsPDF('p', 'mm', 'a4');
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
        console.log('pdfWidth',pdfWidth, 'imgWidth', imgWidth);

        if (imgRatio > pdfRatio) {
          imgHeightInPdf = pdfHeight;
          imgWidthInPdf = pdfHeight / imgRatio;
        }
        else {
          imgHeightInPdf = pdfWidth * imgRatio;
          imgWidthInPdf = pdfWidth ;
        }
        pdf.addImage(imgData, 'SVG', margin, 0, pdfWidth - 2 * margin, imgHeightInPdf);

        // Add the text to the new page
//        let currentY = pdfHeight + lineHeight > pdfHeight - margin ? margin: pdfHeight + lineHeight;
        let currentY = imgHeightInPdf + margin;

        const renderSection = (title, questions) => {

        // Add the heading
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(16);
        pdf.text(title, margin, currentY);
        currentY += lineHeight * 2; // Add some margin after the heading
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(12);

        questions.forEach((q, index) => {
          const question = q.text + " "; // Start with the question text
          const answer = q.answer_text;
          const fullText = question + answer;

          // check if full text fits in one line
          const fullTextLines = pdf.splitTextToSize(fullText, pdfWidth - 2 * margin);

          if (fullTextLines.length == 1) {
            if (currentY + lineHeight > pdfHeight - margin) {
              pdf.addPage();
              currentY = margin;
            }
            pdf.text(question, margin, currentY);
            pdf.setFont(undefined, 'bold');
            pdf.text(answer, margin + pdf.getTextWidth(question) , currentY);
            pdf.setFont(undefined, 'normal');
            currentY += lineHeight;
          } else {
            const questionLines = pdf.splitTextToSize(question, pdfWidth - 2 * margin);
            questionLines.forEach(line => {
              if (currentY + lineHeight > pdfHeight - margin) {
                pdf.addPage();
                currentY = margin;
              }
              pdf.text(line, margin, currentY);
              currentY += lineHeight;
            });

            const answerLines = pdf.splitTextToSize(q.answer_text, pdfWidth - 2 * margin);
            // Add the bold answer text
            pdf.setFont(undefined, 'bold');
            answerLines.forEach(line => {
              if (currentY + lineHeight > pdfHeight - margin) {
                pdf.addPage();
                currentY = margin;
              }
              pdf.text(line, margin, currentY);
              currentY += lineHeight;
            });
            // Reset font type
            try {
              pdf.setFont(undefined, 'normal');
            } catch (error) {
              console.error('error setting font to normal', error);
            }
          }
          currentY += lineHeight;
        });
      }
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(16);
        currentY += lineHeight * 2; // Add some margin before the heading
        pdf.text("Your Answers", pdfWidth / 2 , currentY);
        currentY += lineHeight * 2; // Add some margin after the heading
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(12);
         // Render each section
        renderSection("Behavior questions", groupedQuestions['B']);
        renderSection("Intellectual questions", groupedQuestions['I']);
        renderSection("Technical questions", groupedQuestions['T']);
        renderSection("Emotional questions", groupedQuestions['E']);

        console.log(" save BITE_score.pdf");
        pdf.save('BITE_score.pdf', { returnPromise: true });
        setLoading(false);
      }).catch(() => {
        setLoading(false); // Ensure to stop loading in case of an error
      });
    } else {
      console.log("empty svg");
      setLoading(false); // Ensure to stop loading in case of an error
    }
  };

  const calculateWrappedTextHeight = (text, maxWidth, lineHeight, num) => {
    const words = text.split(' ');
    let currentLine = '';
    let lineCount = 1; // Start with one line

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = getTextWidth(testLine, '16px Roboto');
      if (testWidth > maxWidth) {
        lineCount++; // Increment line count only when wrapping
        currentLine = word; // Start new line with the current word
      } else {
        currentLine = testLine;
      }
    });

    const deltaHeight = lineCount * lineHeight;
    return deltaHeight;
  };

  const getTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  return (
    <div className="results-container">
      <div className="report-controls" ref={reportControlsRef}>
        <div className="separator"></div>
        <section className="results" >
          <ShareComponent />
        </section>
        <div className="report-links-container">
          <button className="report-link" onClick={generatePDF}>
            {loading ? 'Generating...' : 'Download Your Scores as PDF'}
          </button>
          <button className="report-link" onClick={() => navigate('/')}>
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
        <div className="answer-container">
         <p><strong>Behavior questions</strong></p>
          {groupedQuestions['B'].map((q, index) => (
            <div key={q.num}> 
                {q.text}
                <strong> {q.answer_text ? q.answer_text : ' No answer'}</strong>
            </div>
          ))}
         <p><strong>Information questions</strong></p>
          {groupedQuestions['I'].map((q, index) => (
            <div key={q.num}> 
                {q.text}
                <strong> {q.answer_text ? q.answer_text : ' No answer'}</strong>
            </div>
          ))}
         <p><strong>Thought questions</strong></p>
          {groupedQuestions['T'].map((q, index) => (
            <div key={q.num}> 
                {q.text}
                <strong> {q.answer_text ? q.answer_text : ' No answer'}</strong>
            </div>
          ))}
         <p><strong>Emotion questions</strong></p>
          {groupedQuestions['E'].map((q, index) => (
            <div key={q.num}> 
                {q.text}
                <strong> {q.answer_text ? q.answer_text : ' No answer'}</strong>
            </div>
          ))}
        </div>
        {/* Hidden SVG for PDF generation */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
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
