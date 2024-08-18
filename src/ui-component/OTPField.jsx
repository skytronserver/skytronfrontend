import React, { useState, useRef } from 'react';
import { TextField, Grid } from '@mui/material';

const OTPField = ({ length, onChange }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1);
      setOtp(newOtp);
      onChange(newOtp.join(''));

      if (value && index < length - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
      setOtp(newOtp);
      onChange(newOtp.join(''));
      inputRefs.current[pastedData.length - 1]?.focus();
    }
    e.preventDefault();
  };

  return (
    <Grid container justifyContent="center" spacing={2}>
      {Array(length).fill(0).map((_, index) => (
        <Grid item xs={2} sm={1} key={index}>
          <TextField
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            inputProps={{
              maxLength: 1,
              style: { textAlign: 'center' }
            }}
            inputRef={(el) => (inputRefs.current[index] = el)}
            fullWidth
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default OTPField;
