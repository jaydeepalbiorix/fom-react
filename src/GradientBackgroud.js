import React from "react";

const GradientBackground = () => {
  const styles = {
    background: "linear-gradient(to bottom right, #ff0000, #0000ff)",
    width: "100%",
    height: "100vh",
  };

  return <div style={styles}></div>;
};

export default GradientBackground;
