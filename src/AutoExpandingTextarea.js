import React, { useState, useEffect, useRef } from "react";

const AutoExpandingTextarea = ({
  className,
  style = { maxWidth: "80%", minHeight: "25px", overflow: "hidden" },
  placeholder = "Enter comments...",
  defaultValue,
  onBlur,
}) => {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [text]);

  return (
    <textarea
      ref={textareaRef}
      className={className}
      onChange={(e) => setText(e.target.value)}
      style={style}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onBlur={onBlur}
    />
  );
};
export default AutoExpandingTextarea;
