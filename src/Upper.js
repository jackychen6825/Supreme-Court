import React from "react";
import "./Upper.css";

export default function Upper() {
  return (
    <div className="upper-container">
      <img
        className="supreme-court-photo"
        src="https://images.unsplash.com/photo-1524633712235-22da046738b4?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=928&q=80"
        alt=""
      />
      <div className="upper-text-container">
        <div className="upper-header-container">
          Lorem ipsum dolor sit amet consectetur
        </div>
        <div className="upper-body-container">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Diam ut
          venenatis tellus in metus vulputate. Urna nec tincidunt praesent
          semper feugiat nibh sed pulvinar.
        </div>
        <div className="button-container">
          <button className="header-button">This is a button</button>
        </div>
      </div>
    </div>
  );
}
