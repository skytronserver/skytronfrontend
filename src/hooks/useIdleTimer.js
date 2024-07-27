import { useState, useEffect } from "react";

const useIdleTimer = (logoutCallback, timeout = 300000) => {
  //take state to check if the user is idle or not
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    //variable for storing the timeout
    let timeoutId;
    const handleActivity = () => {
      //when ever user interact we make is idle to false and clear the timeout
      setIsIdle(false);
      clearTimeout(timeoutId);
      //else if the user doesn't interact for certain amount of time then it will update the state as it is idle and then the logout can be called
      timeoutId = setTimeout(() => setIsIdle(true), timeout);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];

    events.forEach((event) => window.addEventListener(event, handleActivity));

    handleActivity(); // Initialize the timeout

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [timeout]);

  useEffect(() => {
    if (isIdle) {
      logoutCallback();
    }
  }, [isIdle, logoutCallback]);

  return isIdle;
};

export default useIdleTimer;
