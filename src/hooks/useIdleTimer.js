import { useState, useEffect } from 'react';
import { debounce } from 'helper';
const useIdleTimer = (logoutCallback, timeout = 300000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (typeof logoutCallback !== 'function') {
      console.error('logoutCallback must be a function');
      return;
    }

    let timeoutId;
    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsIdle(true), timeout);
    };

    const debounceHandleActivity = debounce(handleActivity, 200);

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    events.forEach((event) => window.addEventListener(event, debounceHandleActivity));

    handleActivity(); // Initialize the timeout

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, debounceHandleActivity));
    };
  }, [timeout, logoutCallback]);

  useEffect(() => {
    if (isIdle) {
      logoutCallback();
    }
  }, [isIdle, logoutCallback]);

  return isIdle;
};
export default useIdleTimer;
