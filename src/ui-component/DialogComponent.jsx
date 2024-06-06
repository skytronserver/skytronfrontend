import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
  } from "@mui/material";
const DialogComponent = ({open,handleClose,message,errorList}) => {
  return (
    <Dialog open={open} onClose={handleClose} style={{ padding: "30px" }}>
      <DialogContent>
        <p>{message}</p>
        {(typeof errorList === "string" ||
          (Array.isArray(errorList) && errorList.length > 0)) && (
          <ul className="error-list">
            {typeof errorList === "string" ? (
              <li>{errorList}</li>
            ) : (
              errorList.map((item) => <li key={item.field}>{item.message}</li>)
            )}
          </ul>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="primary"
          autoFocus
          variant="outlined"
          style={{ margin: "auto" }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogComponent