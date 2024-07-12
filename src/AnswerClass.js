import React, { useEffect, useState } from 'react';

// Function to calculate the width of the text
const AnswerClass = ({ question, answer, category, currentY, height, svgWidth}) => {

    const [wrappedText, setWrappedText] = useState({lines: [], height:0});
    //const startY = currentY || 640; // Initial Y position for the first text item
    const lineSpacing = 20; // Space between each line
    const maxWidth = svgWidth - 50; // Adjust as needed based on your layout

    /*useEffect(() => {
        if (question && answer) {
          const combinedText = `${question} ${answer}`;
          const { lines, height } = wrapText(combinedText, maxWidth, lineSpacing);
          setWrappedText({ lines, height });
        }
    }, [question, answer, maxWidth, lineSpacing ]);*/

      // Function to split text into lines based on the available width
    const wrapText = (text, maxWidth, lineHeight) => {
        const words = text.split(' ');
        let currentLine = '';
        let lines = [];
        let height = lineHeight;

        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = Math.round(getTextWidth(testLine, '16px Roboto'),0); // Adjust font size and family as needed
          //if (testLine.includes('ethnicity') || testLine.includes('country')) {
          //    console.log('testWidth',testLine, testWidth, maxWidth);
          // }
          if (testWidth > maxWidth) {
            height += lineHeight;
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });

        if (currentLine) {
          lines.push(currentLine);
        }

        //if (lines.length>1) {
        //    console.log('maxWidth',maxWidth,'lines',lines);
        //}
        return {lines, height};
    }; //end wrapText

    const getTextWidth = (text, font) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = font;
      const metrics = context.measureText(text);
      return metrics.width;
    };

    if (!question || !answer) {
        console.log("no answer");
        return null 
    };

    const combinedText = `${question} ${answer}`
    const width = getTextWidth(combinedText, '16px Roboto')
    const { lines, height2 } = wrapText(combinedText, maxWidth, lineSpacing);
    //if (category==='I')
    //console.log('answer class report ', category, combinedText, height,width,svgWidth,lines);
    //setWrappedText({ lines, height2 });

    /*return (
        <text x="30" y={currentY} fill="black" className="Answer">
        {lines[0]}
        <tspan fontWeight="bold">{lines.length >1 ? lines[1] : '' }</tspan>
        </text>
    );*/
    return (
        <text x="30" y={currentY} fill="black" className="Answer">
          {lines.map((line, i) => {
            const splitIndex = line.indexOf(answer);
            const questionPart = line.slice(0, splitIndex);
            const answerPart = line.slice(splitIndex);
              //console.log('line',line, questionPart);

            return (
              <tspan key={i} x="30" dy={i === 0 ? 0: lineSpacing} >
                {questionPart}
                <tspan fontWeight="bold">{answerPart}</tspan>
              </tspan>
            );
          })}
        </text>
      ); 
};

export default AnswerClass;
