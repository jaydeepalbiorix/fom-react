import React, { useEffect, useState } from "react";
import popupStyles from "./custom-popup.module.css";
const CustomPopup = (props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  return (
    <div
      style={{
        visibility: show ? "visible" : "hidden",
        opacity: show ? "1" : "0",
      }}
      className={popupStyles.overlay}
    >
      <div className={popupStyles.popup}>
        <div className={popupStyles.content}>{props.children}</div>
      </div>
    </div>
  );
};

export default CustomPopup;
