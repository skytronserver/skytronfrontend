import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

function DialogAlert({open,title,detailMessage,primaryAction,secondaryAction,primaryText,secondaryText,handleClose}) {
  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {detailMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {secondaryText ?? <Button onClick={secondaryAction} color="secondary">
            {secondaryText}
          </Button>
          }
          <Button onClick={primaryAction} color="primary" autoFocus>
            {primaryText}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DialogAlert;
