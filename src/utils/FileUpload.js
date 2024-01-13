import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function FileUpload({name,placeholder}) {
    const [selectedFileName, setSelectedFileName] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setSelectedFileName(selectedFile.name);
    }
  };
  return (
    <Button component="label" variant="outlined" fullWidth  startIcon={<CloudUploadIcon />}>
      {placeholder}
      {selectedFileName &&  ` : ${selectedFileName}`}
      <VisuallyHiddenInput
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: 'image/*, application/pdf' }}
        />
      </Button>
      
  );
}