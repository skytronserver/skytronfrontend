import React from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
  } from "@mui/material";

const messageDesc={
  'UNIQUE constraint failed: skytron_api_user.mobile':'Looks like this number is already registered. Would you like to try a different number',
  'UNIQUE constraint failed: skytron_api_user.email':'It looks like this email address is already in use.',
}
const DialogComponent = ({open,handleClose,message,errorList}) => {
  return (
    <Dialog open={open} onClose={handleClose} style={{ padding: "30px" }}>
      <DialogContent>
        <p dangerouslySetInnerHTML={{ __html: message }}/>
        {(typeof errorList === "string" ||
          (Array.isArray(errorList) && errorList.length > 0)) && (
          <ul className="error-list">
            {typeof errorList === "string" ? (
              <li>{messageDesc?.[errorList] ?? <p dangerouslySetInnerHTML={{ __html: errorList }}/>}</li>
            ) : (
              errorList.map((item) => <li key={item.field}>
                {messageDesc?.[item.message] ?? item.message}
                </li>)
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