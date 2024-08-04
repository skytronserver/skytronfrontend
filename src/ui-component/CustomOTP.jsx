import React, { useState, useRef } from 'react';
import { TextField, Box } from '@mui/material';

const CustomOTP = ({ length, onChange }) => {
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

  return (
    <Box display="flex" justifyContent="center">
      {Array(length).fill(0).map((_, index) => (
        <TextField
          key={index}
          value={otp[index]}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          inputProps={{
            maxLength: 1,
            style: { textAlign: 'center' }
          }}
          inputRef={(el) => (inputRefs.current[index] = el)}
          style={{ width: 40, marginRight: 8 }}
        />
      ))}
    </Box>
  );
};

export default CustomOTP;
