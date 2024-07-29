import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import { ClipLoader } from "react-spinners";

const PDFTextGenerator = ({ content }) => {
  const contentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (contentRef.current) {
      setTextContent(
        contentRef.current.innerText || contentRef.current.textContent
      );
    }
  }, [content]);

  const generatePDF = () => {
    setLoading(true);
    const pdf = new jsPDF();

    const lines = textContent.split("\n");
    lines.forEach((line, index) => {
      pdf.text(line, 10, 10 + index * 10);
    });
    pdf.save("BITE_answers.pdf");
    setLoading(false);
  };

  return (
    <div>
      <div>{content}</div>
      <button onClick={generatePDF} disabled={loading}>
        {loading ? "Generating..." : "Generate PDF"}
      </button>
      {loading && <ClipLoader size={35} />}
    </div>
  );
};

export default PDFTextGenerator;
