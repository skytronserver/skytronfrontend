import React from 'react';
import { Snackbar, Alert } from '@mui/material';
function AutoHideAlert({ open, onClose, message,type }){
    return (
      <Snackbar
      open={open}
      autoHideDuration={6000} // Duration before auto-hiding (in milliseconds)
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Center horizontally
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // Center vertically and horizontally
        zIndex: 1300, // Ensure it's above other content
      }}
    >
        <Alert
          onClose={onClose}
          severity={type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    );
  };
export default AutoHideAlert