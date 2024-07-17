const PieChart = ({ greenSize, orangeSize, x, y, radius }) => {
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
        fill="green"
      />
      <path
        d={`M 0 0 L ${greenX} ${greenY} A ${radius} ${radius} 0 ${
          1 - largeArcFlag
        } 1 ${radius} 0 Z`}
        fill="orange"
      />
    </g>
  );
};
