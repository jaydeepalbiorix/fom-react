import React, {
  useRef,
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
} from "react";
import { debounce } from "lodash";
import "./SelectableSquares.css";

const SelectableSquares = ({
  questionNum,
  options,
  selectedOption,
  onOptionSelect,
}) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const arrowContainerRef = useRef(null);
  const [labelPositions, setLabelPositions] = useState({ left: 0, right: 0 });

  const handleClick = (option) => {
    onOptionSelect(questionNum, option);
  };

  const updateLineWidth = useCallback(() => {
    if (svgRef.current && containerRef.current && arrowContainerRef.current) {
      const svg = svgRef.current;
      const container = containerRef.current;
      const arrowContainer = arrowContainerRef.current;

      const containerWidth = container.clientWidth;
      const firstButton = container.querySelector(".square");
      const lastButton = container.querySelector(".square:last-child");
      if (firstButton && lastButton) {
        const left = firstButton.offsetLeft + 50;
        const right = lastButton.offsetLeft + lastButton.offsetWidth - 50;

        const x1 = left + 60;
        const x2 = right - 60;

        const line = svg.querySelector("line");
        const polygons = svg.querySelectorAll("polygon");
        if (line && polygons.length >= 2) {
          line.setAttribute("x1", x1);
          line.setAttribute("x2", x2);
          polygons[0].setAttribute(
            "points",
            `${x2 - 10},6 ${x2},12 ${x2 - 10},18`
          );
          polygons[1].setAttribute(
            "points",
            `${x1 + 10},6 ${x1},12 ${x1 + 10},18`
          );
        }
        svg.setAttribute("viewBox", `0 0 ${containerWidth} 24`);

        setLabelPositions({ left, right });
        arrowContainer.style.width = `${containerWidth}px`;
      } else {
        console.error("Buttons not found in square container", container);
      }
    }
  }, []);

  const debouncedUpdateLineWidth = useCallback(debounce(updateLineWidth, 200), [
    updateLineWidth,
  ]);

  useLayoutEffect(() => {
    updateLineWidth();
    window.addEventListener("resize", debouncedUpdateLineWidth);
    return () => window.removeEventListener("resize", debouncedUpdateLineWidth);
  }, [debouncedUpdateLineWidth, updateLineWidth]);

  useEffect(() => {
    setTimeout(updateLineWidth, 0);
  }, [options, selectedOption, updateLineWidth]);

  return (
    <div className="selectable-squares-container" ref={containerRef}>
      <div className="arrow-container-wrapper">
        <span
          className="arrow-left-label"
          style={{ left: `${labelPositions.left}px` }}
        >
          1 - Never
        </span>
        <div
          className="arrow-container"
          ref={arrowContainerRef}
          style={{ position: "relative" }}
        >
          <svg
            ref={svgRef}
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-arrow-right"
          >
            <line y1="12" y2="12" stroke="currentColor" strokeWidth="2"></line>
            <polygon fill="currentColor"></polygon>
            <polygon fill="currentColor"></polygon>
          </svg>
        </div>
        <span
          className="arrow-right-label"
          style={{ left: `${labelPositions.right}px` }}
        >
          6 - Always
        </span>
      </div>
      <div className="square-container" style={{ marginTop: "20px" }}>
        {options.map((option, index) => (
          <div
            key={index}
            className={`square ${
              selectedOption === index + 1 ? "selected" : ""
            }`}
            onClick={() => handleClick(index + 1)}
            style={{ marginLeft: index > 0 ? "10px" : "0" }}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SelectableSquares;
