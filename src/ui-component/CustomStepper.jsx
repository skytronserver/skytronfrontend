import React from 'react';
import {
  Box,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';


function CustomStepper({activeStep,label,steps}) {

  const theme = useTheme();
 

  return (
    <Box sx={{ width: '100%' }}>
      <Stepper activeStep={activeStep} orientation='horizontal' alternativeLabel>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{ label && step.name}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}

export default CustomStepper;
