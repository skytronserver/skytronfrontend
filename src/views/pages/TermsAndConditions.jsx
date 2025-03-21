import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function TermsAndConditions() {
  return (
    <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: 400, marginBottom: 4 }}
        >
          Terms & Conditions
        </Typography>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">1. Acceptance of Terms</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              By accessing and using SkyTron, you acknowledge that you have read, understood, and agree to comply with these Terms. These Terms apply to all users, including those who register an account or use the App without an account.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">2. Eligibility</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              You must be at least 18 years old to use this App. By using SkyTron, you represent that you have the legal capacity to enter into this agreement.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">3. Use of the App</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              You agree to:
            </Typography>
            <ul>
              <li>Use the App only for lawful purposes and in accordance with these Terms.</li>
              <li>Not misuse, exploit, or interfere with the functionality, security, or integrity of the App.</li>
              <li>Not attempt unauthorized access, reverse engineering, or data extraction from the App.</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">4. User Accounts</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              You agree to:
            </Typography>
            <ul>
              <li>Create an account to access certain features</li>
              <li>Maintain the confidentiality of your account credentials</li>
              <li>Accept that we reserve the right to suspend or terminate your account if we detect any unauthorized activity</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">5. Privacy Policy</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              Our Privacy Policy governs how we collect, use, and protect your personal information. 
              By using SkyTron, you acknowledge and accept our Privacy Policy.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">6. Intellectual Property</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              All content within the App, including text, graphics, trademarks, logos, and software, 
              is owned or licensed by us and protected under applicable copyright and trademark laws.
            </Typography>
            <Typography variant="body1">
              You may not copy, modify, distribute, or create derivative works from any content 
              without our prior written consent.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">7. Third-Party Services</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              SkyTron may integrate with third-party services, and we are not responsible for their terms, 
              policies, or actions. Your use of third-party services is at your own risk.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">8. Limitation of Liability</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              We provide the App on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind.
            </Typography>
            <ul>
              <li>We are not responsible for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the App.</li>
              <li>We do not guarantee uninterrupted, error-free operation of the App.</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">9. Termination</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              We reserve the right to suspend or terminate your access to the App at our discretion, 
              without notice, if we determine that you have violated these Terms or engaged in unlawful activity.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">10. Governing Law & Dispute Resolution</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              These Terms shall be governed by the laws of India. Any disputes shall be resolved 
              in the courts of Guwahati, Assam, India.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">11. Modifications to the Terms</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1">
              We reserve the right to update these Terms at any time. Changes will be effective upon 
              posting within the App. Continued use after modifications constitutes acceptance of the new Terms.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">12. Contact Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              For any questions or concerns regarding these Terms, please contact us at:
            </Typography>
            <Typography variant="body1">
              Email: contact@skytrack.tech
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Container>
    </Box>
  );
}

export default TermsAndConditions; 