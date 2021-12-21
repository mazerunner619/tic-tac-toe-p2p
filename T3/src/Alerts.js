import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Slide from '@material-ui/core/Slide';

export default function AlertMessage({open, message, severity, onClose}) {


  return (
    <div>
      <Snackbar
        open={open}
        onClose={onClose}
        TransitionComponent={Slide}
        message={message}
        severity={severity}
        autoHideDuration = "5000"
        anchorOrigin = {{vertical : "center",horizontal :  "top"}}
      />
    </div>
  );
}
