import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import {Divider} from '@mui/material';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80vw',
  borderRadius : '10px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export default function Request({from, show, onHide, onAccept, onReject}) {
  return (
    <div>
      <Modal
        open={show}
        onClose={onHide}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {from.name} sent you a request
          </Typography>
          <br/>
          <Divider/>
          <Button color="success" onClick = {onAccept}>Accept</Button>
          <Button color="error" onClick = {onReject}>Reject</Button>
        </Box>
      </Modal>
    </div>
  );
}
