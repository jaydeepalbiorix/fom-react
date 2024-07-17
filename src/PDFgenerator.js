import React, { useRef, useState, forwardRef } from "react";
import { ClipLoader } from "react-spinners";

const PDFGenerator = forwardRef(({ content, loading }, ref) => {
  return (
    <div>
      <div ref={ref}>{content}</div>
      {loading && <ClipLoader size={35} />}
    </div>
  );
});

export default PDFGenerator;
