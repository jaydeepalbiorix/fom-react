import React from "react";

const SMSIcon = ({ size = 32, round = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      borderRadius: round ? "50%" : "0%",
      backgroundColor: round ? "#4CAF50" : "transparent",
      padding: round ? "0px" : "0",
    }}
  >
    <path d="M4 4H20V15H8L4 18V4Z" fill={round ? "white" : "#4CAF50"} />
  </svg>
);

export default SMSIcon;
