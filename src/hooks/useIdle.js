import { useState, useEffect, useCallback } from "react";
const useIdle = (timeout = 300000) => {
    const [isIdle, setIsIdle] = useState(false);
    const checkForActivity = useCallback(() => {
        const expiryTime = localStorage.getItem("expiryTime");
        if (expiryTime < Date.now()) {
            setIsIdle(true);
        }
    }, []);
    const updateExpiryTime = useCallback(() => {
        const expiryTime = Date.now() + timeout;
        localStorage.setItem("expiryTime", expiryTime);
    }, [timeout]);

    useEffect(() => {
        const interval = setInterval(() => {
            checkForActivity();
        }, 5000);
        return () => {
            clearInterval(interval);
        };
    }, [checkForActivity]);

    useEffect(() => {
        updateExpiryTime();
        const events = ["mousemove", "keydown", "mousedown", "touchstart", "scroll", "keypress"];
        events.forEach((event) => window.addEventListener(event, updateExpiryTime));
        return () => {
            events.forEach((event) =>
                window.removeEventListener(event, updateExpiryTime)
            );
        };
    }, [updateExpiryTime]);

    return isIdle;

}
export default useIdle;