import { useState, useEffect } from "react";

const getWindowWidth = () => window.innerWidth; //we can grab the window width with this function  

export default function useWindowDimensions() {
  const [windowWidth, setWindowWidth] = useState(getWindowWidth()); //setting the state  to the window's current width

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(getWindowWidth());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
}
