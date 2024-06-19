import { useState, useEffect, useCallback } from 'react';

const useIdleTimer = (timeout, onIdle) => {
  const [lastActivity, setLastActivity] = useState(Date.now());

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];

    const handleEvent = () => resetTimer();

    events.forEach(event => window.addEventListener(event, handleEvent));

    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeout) {
        onIdle();
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleEvent));
      clearInterval(interval);
    };
  }, [lastActivity, resetTimer, timeout, onIdle]);

  return { resetTimer };
};

export default useIdleTimer;
