import React from 'react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
function AlertBox({severity,isOpen,handleAlertClick,title,message}) {
  return (
    <>
      <Snackbar
        open={isOpen}
        autoHideDuration={6000}
        onClose={handleAlertClick}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClick} severity={severity} sx={{ width: '100%' }}>
          <AlertTitle>{title}</AlertTitle>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AlertBox;
