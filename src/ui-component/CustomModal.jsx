import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const CustomModal = ({ open, onClose, title, content, actions }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      disableBackdropClick
      disableEscapeKeyDown
      aria-labelledby="custom-modal-title"
      aria-describedby="custom-modal-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 300,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography id="custom-modal-title" variant="h6">
          {title}
        </Typography>
        <Typography id="custom-modal-description" sx={{ mt: 2 }}>
          {content}
        </Typography>
        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          {actions ? (
            actions
          ) : (
            <Button onClick={onClose} color="primary" variant="contained">
              OK
            </Button>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
