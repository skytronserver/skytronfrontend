import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useSOSIdleChallenge
 * 
 * If an SOS executive/team-lead does not attend any call for 5 minutes,
 * a challenge is shown. If not solved in 30 seconds, they are logged out.
 */
const useSOSIdleChallenge = ({
  idleTimeout = 300000,     // 5 minutes
  challengeTimeout = 30000, // 30 seconds
  enabled = true,
} = {}) => {
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeExpired, setChallengeExpired] = useState(false);
  const [countdown, setCountdown] = useState(Math.floor(challengeTimeout / 1000));

  const idleTimerRef = useRef(null);
  const challengeTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    idleTimerRef.current = null;
    challengeTimerRef.current = null;
    countdownIntervalRef.current = null;
  }, []);

  // Start the idle timer
  const startIdleTimer = useCallback(() => {
    // Clear existing idle timer if any
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    console.log("[SOS Idle] Timer started. Challenge in", idleTimeout / 1000, "seconds");

    idleTimerRef.current = setTimeout(() => {
      console.log("[SOS Idle] Time up! Showing challenge...");
      setShowChallenge(true);

      const maxSecs = Math.floor(challengeTimeout / 1000);
      setCountdown(maxSecs);

      let remaining = maxSecs;
      countdownIntervalRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      }, 1000);

      challengeTimerRef.current = setTimeout(() => {
        console.log("[SOS Idle] Challenge expired! Logging out...");
        setChallengeExpired(true);
      }, challengeTimeout);

    }, idleTimeout);
  }, [idleTimeout, challengeTimeout]);

  // Reset idle timer (called on call accept/broadcast/close)
  const resetIdleTimer = useCallback(() => {
    console.log("[SOS Idle] Timer reset by user action");
    clearAllTimers();
    setShowChallenge(false);
    setChallengeExpired(false);
    setCountdown(Math.floor(challengeTimeout / 1000));
    startIdleTimer();
  }, [clearAllTimers, startIdleTimer, challengeTimeout]);

  // Called when captcha is solved
  const onChallengeSuccess = useCallback(() => {
    console.log("[SOS Idle] Challenge solved! Restarting timer.");
    clearAllTimers();
    setShowChallenge(false);
    setChallengeExpired(false);
    setCountdown(Math.floor(challengeTimeout / 1000));
    startIdleTimer();
  }, [clearAllTimers, startIdleTimer, challengeTimeout]);

  // Start on mount, cleanup on unmount
  useEffect(() => {
    if (!enabled) return;

    startIdleTimer();

    return () => {
      clearAllTimers();
    };
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);



  return {
    showChallenge,
    challengeExpired,
    countdown,
    resetIdleTimer,
    onChallengeSuccess,
  };
};

export default useSOSIdleChallenge;


