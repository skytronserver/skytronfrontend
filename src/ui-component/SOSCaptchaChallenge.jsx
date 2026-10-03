import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  LinearProgress,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TimerIcon from "@mui/icons-material/Timer";

/**
 * Generates a random math challenge
 */
const generateMathChallenge = () => {
  const a = Math.floor(Math.random() * 9) + 1;  // 1 to 9
  const b = Math.floor(Math.random() * 9) + 1;  // 1 to 9
  return { question: `${a}  +  ${b}  =  ?`, answer: a + b };
};

const SOSCaptchaChallenge = ({ open, countdown, onSuccess, onExpired, challengeExpired }) => {
  const [challenge, setChallenge] = useState(() => generateMathChallenge());
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const maxCountdown = 30;

  const refreshChallenge = useCallback(() => {
    setChallenge(generateMathChallenge());
    setUserAnswer("");
    setError("");
    setShake(false);
  }, []);

  useEffect(() => {
    if (open) {
      refreshChallenge();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open, refreshChallenge]);

  useEffect(() => {
    if (challengeExpired && open) onExpired();
  }, [challengeExpired, open, onExpired]);

  const handleVerify = () => {
    const parsed = parseInt(userAnswer, 10);
    if (isNaN(parsed)) { setError("Enter a valid number"); return; }
    if (parsed === challenge.answer) {
      onSuccess();
    } else {
      setError("Incorrect! Try again");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setUserAnswer("");
      refreshChallenge();
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleVerify(); };

  const progress = (countdown / maxCountdown) * 100;
  const timerColor = countdown > 15 ? "#4caf50" : countdown > 5 ? "#ff9800" : "#f44336";

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          animation: shake ? "shake 0.4s ease-in-out" : "none",
          "@keyframes shake": {
            "0%, 100%": { transform: "translateX(0)" },
            "20%": { transform: "translateX(-8px)" },
            "40%": { transform: "translateX(8px)" },
            "60%": { transform: "translateX(-6px)" },
            "80%": { transform: "translateX(6px)" },
          },
        },
      }}
    >
      {/* Top progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 4,
          backgroundColor: "#e0e0e0",
          "& .MuiLinearProgress-bar": {
            backgroundColor: timerColor,
            transition: "transform 1s linear",
          },
        }}
      />

      {/* Warning banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #512da8 0%, #311b92 100%)",
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <WarningAmberIcon sx={{ color: "#ffd600", fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 700, lineHeight: 1.2 }}>
            Are You Still There?
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}>
            You have been idle for 5 minutes. Solve this to stay online.
          </Typography>
        </Box>
      </Box>




      <DialogContent sx={{ px: 4, py: 4 }}>
        {/* Timer row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            mb: 3,
            py: 2,
            px: 2,
            borderRadius: 1,
            backgroundColor: countdown > 10 ? "#fff3e0" : "#ffebee",
            border: `1px solid ${countdown > 10 ? "#ffe0b2" : "#ffcdd2"}`,
          }}
        >
          <TimerIcon sx={{ fontSize: 20, color: timerColor }} />
          <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>
            Auto logout in
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 800,
              color: timerColor,
              fontSize: "1.1rem",
              minWidth: 28,
              textAlign: "center",
            }}
          >
            {countdown}s
          </Typography>
        </Box>

        {/* Challenge box */}
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 3,
            mb: 3,
            backgroundColor: "#f5f0ff",
            borderRadius: 1.5,
            border: "1px solid #d1c4e9",
          }}
        >
          <Typography variant="caption" sx={{ color: "#7c4dff", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            Solve to continue
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#311b92",
              mt: 1,
              fontFamily: "'Roboto Mono', monospace",
              letterSpacing: 3,
            }}
          >
            {challenge.question}
          </Typography>
        </Box>

        {/* Input + Button */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
          <TextField
            fullWidth
            placeholder="Your answer"
            variant="outlined"
            size="small"
            type="number"
            value={userAnswer}
            onChange={(e) => { setUserAnswer(e.target.value); setError(""); }}
            onKeyDown={handleKeyDown}
            error={!!error}
            helperText={error}
            inputRef={inputRef}
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused fieldset": { borderColor: "#673ab7" },
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleVerify}
            disabled={!userAnswer.trim()}
            sx={{
              backgroundColor: "#673ab7",
              minWidth: 120,
              height: 48,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { backgroundColor: "#512da8" },
              "&.Mui-disabled": { backgroundColor: "#e0e0e0" },
            }}
          >
            Verify
          </Button>
        </Box>

        {/* Warning footer */}
        {countdown <= 10 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1.5,
              justifyContent: "center",
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 16, color: "#f44336" }} />
            <Typography variant="caption" sx={{ color: "#f44336", fontWeight: 600 }}>
              You will be logged out soon!
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SOSCaptchaChallenge;
