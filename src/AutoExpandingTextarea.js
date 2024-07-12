
import React, { useState, useEffect, useRef } from 'react';

const AutoExpandingTextarea = ({
    className,
    style = { maxWidth: '80%', minHeight: '25px', overflow: 'hidden' },
    placeholder = 'Enter comments...',
    defaultValue,
    onBlur
}) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'inherit'; // Reset the height
            const scrollHeight = textareaRef.current.scrollHeight; // Get the scroll height
            textareaRef.current.style.height = `${scrollHeight}px`; // Set textarea height based on scroll height
        }
    }, [text]); // Depend on text to re-calculate on input change

    return (
        <textarea
            ref={textareaRef}
            className={className}
            onChange={(e) => setText(e.target.value)}
            style={style} // Set a minimum height and hide scrollbar
            placeholder={placeholder}
            defaultValue={defaultValue}
            onBlur={onBlur}
        />
    );
};
export default AutoExpandingTextarea;
