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
          {errorList?.length>0 && (
            <ul className="error-list">
              {errorList.map((item)=>{
                return <li key={item.field}>{item.message}</li>
              })}
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
  )
}

export default DialogComponent