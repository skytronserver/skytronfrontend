import { useState, useEffect } from "react";
const useIdleTimer = (logoutCallback, timeout = 300000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timeoutId;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
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
