import React from 'react';
const AnswerClass = ({ question, answer, currentY, svgWidth }) => {

  const lineSpacing = 20;
  const maxWidth = svgWidth - 50;

  const wrapText = (text, maxWidth, lineHeight) => {
    const words = text.split(' ');
    let currentLine = '';
    let lines = [];
    let height = lineHeight;

    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = Math.round(getTextWidth(testLine, '16px Roboto'), 0);
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
    return { lines, height };
  };

  const getTextWidth = (text, font) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  };

  if (!question || !answer) {
    return null
  };

  const combinedText = `${question} ${answer}`
  const { lines } = wrapText(combinedText, maxWidth, lineSpacing);

  return (
    <text x="30" y={currentY} fill="black" className="Answer">
      {lines.map((line, i) => {
        const splitIndex = line.indexOf(answer);
        const questionPart = line.slice(0, splitIndex);
        const answerPart = line.slice(splitIndex);

        return (
          <tspan key={i} x="30" dy={i === 0 ? 0 : lineSpacing} >
            {questionPart}
            <tspan fontWeight="bold">{answerPart}</tspan>
          </tspan>
        );
      })}
    </text>
  );
};

export default AnswerClass;
