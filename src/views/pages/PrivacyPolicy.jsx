import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function PrivacyPolicy() {
  return (
    <>
      <Box sx={{ py: 8, backgroundColor: '#f5f5f5' }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ textAlign: "center", fontWeight: 400, marginBottom: 4 }}
          >
            Privacy Policy
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">1. Introduction</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
              Welcome to SkyTron<sup>®</sup>, a vehicle tracking application developed by Skytrack Technologies Pvt Ltd and implemented in collaboration with AMTRON. Your privacy is important to us, and this Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application SkyTron<sup>®</sup>. By using the application, you agree to the terms outlined in this policy.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">2. Information We Collect</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                We collect various types of information to enhance our service, including:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                (a) Personal Information:
              </Typography>
              <ul>
                <li>Name, email address, phone number, and other contact details provided during registration.</li>
                <li>Login credentials to access your SkyTron<sup>®</sup> account.</li>
              </ul>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                (b) Vehicle and Tracking Information:
              </Typography>
              <ul>
                <li>GPS location of registered vehicles in real time.</li>
                <li>Vehicle registration details, including make, model, and identification numbers.</li>
                <li>Trip history, routes, and movement data.</li>
              </ul>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1 }}>
                (c) Device and Usage Information:
              </Typography>
              <ul>
                <li>Device type, operating system, IP address, and mobile network information.</li>
                <li>App usage patterns, interactions, and error logs.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">3. How We Use Your Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                We use the collected data for the following purposes:
              </Typography>
              <ul>
                <li>To provide real-time vehicle tracking and monitoring services.</li>
                <li>To ensure vehicle security and improve road safety.</li>
                <li>To enable users to access trip history and analytics.</li>
                <li>To send important updates, notifications, and alerts related to vehicle movement.</li>
                <li>To prevent fraudulent activities and unauthorized access.</li>
                <li>To comply with legal obligations and regulatory requirements.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">4. Data Sharing and Disclosure</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                We do not sell or rent your personal information. However, we may share information in the following cases:
              </Typography>
              <ul>
                <li>
                  <strong>With Government Authorities &amp; Law Enforcement:</strong> If required by law, we may provide data to government agencies, police, or legal authorities.
                </li>
                <li>
                  <strong>With Service Providers:</strong> We may share data with third-party vendors who assist in hosting, analytics, and technical support.
                </li>
                <li>
                  <strong>With Business Partners:</strong> If SkyTron<sup>®</sup> collaborates with authorized fleet management companies or service partners, necessary information may be shared.
                </li>
                <li>
                  <strong>In Case of Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of business restructuring.
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">5. Data Security Measures</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                We take strict security measures to protect user data, including:
              </Typography>
              <ul>
                <li>Encryption of sensitive information, including location data.</li>
                <li>Secure authentication mechanisms for access control.</li>
                <li>Regular security audits to detect vulnerabilities.</li>
                <li>Restricted access to personal data on a need-to-know basis.</li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">6. User Rights &amp; Choices</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                Users have the following rights concerning their data:
              </Typography>
              <ul>
                <li>
                  <strong>Access &amp; Update:</strong> Users can access and update their profile details.
                </li>
                <li>
                  <strong>Opt-out:</strong> Users can disable location tracking through device settings.
                </li>
                <li>
                  <strong>Data Deletion:</strong> Users can request the deletion of their data by contacting support.
                </li>
                <li>
                  <strong>Withdrawal of Consent:</strong> Users can withdraw consent for data collection by uninstalling the app and notifying us.
                </li>
              </ul>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">7. Retention of Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                We retain user data only as long as necessary for service provision, legal compliance, or security purposes. Once the data is no longer required, it is securely deleted or anonymized.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">8. Third-Party Services &amp; External Links</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                SkyTron<sup>®</sup> may integrate third-party services (such as Bhuvan Maps or payment gateways). We do not control these third-party services, and users should review their respective privacy policies.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">9. Children's Privacy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                SkyTron<sup>®</sup> is not intended for use by children under 13 years old. We do not knowingly collect data from minors. If we become aware of such data collection, we will take steps to delete it.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">10. Changes to This Privacy Policy</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                We may update this policy periodically. Users will be notified of major changes through in-app notifications or email. Continued use of the app after changes implies acceptance of the updated policy.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">11. Contact Us</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" paragraph>
                For any questions or concerns regarding this Privacy Policy, contact us at:
              </Typography>
              <Typography variant="body1">
                Email: contact@skytrack.tech
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Container>
      </Box>
    </>
  );
}

export default PrivacyPolicy;
