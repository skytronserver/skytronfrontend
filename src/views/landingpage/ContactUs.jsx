import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const ContactBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  paddingTop: theme.spacing(8), // Top padding
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  textAlign: 'center',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
}));

const ContactInfo = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
 fontSize: "16px",
 fontWeight: "bold",
 fontStyle: "italic",
  transition: 'transform 0.3s ease, color 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    color: theme.palette.primary.main,
  },
}));

function ContactUs() {
  return (
    <ContactBox id="contact">
      <Typography variant="h2" component="h2" gutterBottom sx={{marginBottom:'48px'}}>
       CONTACT US
      </Typography>
      <ContactInfo variant="body1" >
        Skytrack Technologies Private Limited
      </ContactInfo>
      <ContactInfo variant="body1">
        1 Prasanti Path, Survey, Beltola, Guwahati 781028, Assam
      </ContactInfo>
      <ContactInfo variant="body1">
        Email: <a href="mailto:contact@skytrack.tech" style={{ textDecoration: 'none', color: 'inherit' }}>contact@skytrack.tech</a>
      </ContactInfo>
    </ContactBox>
  );
}

export default ContactUs;
