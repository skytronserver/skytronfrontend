import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.grey[900],
  color: theme.palette.common.white,
  textAlign: 'center',
}));

const FooterLink = styled(Link)(({ theme }) => ({
  margin: theme.spacing(1),
  color: theme.palette.primary.light,
  textDecoration: 'none',
  '&:hover': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
  },
}));

function Footer() {
  return (
    <FooterContainer component="footer">
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Skytrack Technologies Private Limited. All rights reserved.
      </Typography>
      <Box mt={2}>
        <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
        <FooterLink href="/terms-of-service">Terms of Service</FooterLink>
        <FooterLink href="/contact">Contact Us</FooterLink>
      </Box>
    </FooterContainer>
  );
}

export default Footer;
