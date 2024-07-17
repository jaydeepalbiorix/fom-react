import React from "react";

export const DoubleArrowClass = ({
  startx,
  endx,
  starty,
  arrowHeadLength,
  color,
}) => {
  const arrowWidth = 7;
  const tipShave = 17;
  const leftArrowHead = `M ${startx + tipShave},${starty} L ${
    startx + arrowHeadLength
  },${starty - arrowWidth} L ${startx + tipShave},${starty} L ${
    startx + arrowHeadLength
  },${starty + arrowWidth}`;
  const rightArrowHead = `M ${endx - tipShave},${starty} L ${
    endx - arrowHeadLength
  },${starty - arrowWidth} L ${endx - tipShave},${starty} L ${
    endx - arrowHeadLength
  },${starty + arrowWidth}`;
  const arrowShaft = `M ${startx + tipShave},${starty} L ${
    endx - tipShave
  },${starty}`;
  const dValue = `${leftArrowHead} ${arrowShaft} ${rightArrowHead}`;

  return <path d={dValue} stroke={color} strokeWidth="8" fill={color} />;
};

export const SingleArrow = ({
  score,
  starty,
  min,
  max,
  svgWidth,
  arrowWidth,
  arrowHeight,
  strokeWidth,
  color,
}) => {
  const halfWidth = arrowWidth / 3;
  const startx = (score / 100) * (max - min) + min;
  const rectangleHeight = arrowHeight / 2;
  const triangleHeight = arrowHeight / 2;
  const arrowBottom = starty + arrowHeight;
  const rectTopY = arrowBottom - rectangleHeight;

  // Path for the rectangle and triangle
  const dValue = `
    M ${startx - halfWidth}, ${arrowBottom}
    L ${startx + halfWidth}, ${arrowBottom}
    L ${startx + halfWidth}, ${rectTopY}
    L ${startx + halfWidth + halfWidth / 2}, ${rectTopY}
    L ${startx}, ${starty}
    L ${startx - halfWidth - halfWidth / 2}, ${rectTopY}
    L ${startx - halfWidth}, ${rectTopY}
    Z
  `;

  return (
    <>
      <path d={dValue} fill={color} />
      <text
        x={startx}
        y={starty + arrowHeight / 2 + 15}
        textAnchor="middle"
        style={{ fontWeight: 900, fontSize: "28px" }}
        className="influenceScore"
      >
        {score}
      </text>
    </>
  );
};

export const SingleArrow2 = ({
  score,
  starty,
  min,
  max,
  arrowWidth,
  arrowHeight,
  strokeWidth,
  color,
}) => {
  const tipShave = 2;
  const startx = (score / 100) * (max - min) + min;
  const starty1 = starty + 5;
  const arrowHeadHeight = arrowHeight / 3;
  const endx = startx;
  const endy = starty1 - arrowHeight;
  const quarterWidth = arrowWidth / 2;
  const dValue = `M ${startx},${starty1} L ${endx},${
    endy - tipShave
  } M ${endx},${endy} L ${endx - quarterWidth},${
    endy + arrowHeadHeight
  } M ${endx},${endy} L ${endx + quarterWidth},${endy + arrowHeadHeight}`;

  return (
    <path d={dValue} stroke={color} strokeWidth={strokeWidth} fill="none" />
  );
};
