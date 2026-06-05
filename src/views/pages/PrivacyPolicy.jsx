import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function PrivacyPolicy() {
  const brandBlue = '#2b6cb0'; // Professional corporate blue
  const bodyTextColor = '#333333'; // Dark gray

  return (
    <Box sx={{ py: 6, backgroundColor: '#ffffff' }}>
      <Container maxWidth="md">
        {/* Title Section */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#1a202c',
              letterSpacing: '-0.2px',
              fontSize: { xs: '1.4rem', md: '1.6rem' }
            }}
          >
            <span style={{ color: brandBlue }}>Privacy Policy</span>
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '1rem', color: '#666' }}>
            Last Updated: June 2026
          </Typography>
        </Box>

        {/* Welcome Section */}
        <Box sx={{
          p: { xs: 3, md: 4 },
          mb: 5,
          borderRadius: 2,
          border: '1px solid #e2e8f0',
          borderLeft: `6px solid ${brandBlue}`,
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          {/* <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a202c', mb: 2 }}>
            Welcome to SkyTron<sup>®</sup>!
          </Typography> */}
          <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6, color: bodyTextColor, mb: 2 }}>
            SkyTron<sup>®</sup> is an intelligent vehicle tracking and passenger safety / emergency assistance platform
            implemented by AMTRON ("Company," "we," "us," or "our") respects your privacy. It enables real-time monitoring, safety alerts,
            and compliance for public transport and emergency services under the Nirbhaya framework.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1rem', lineHeight: 1.6, color: bodyTextColor }}>
            These Terms and Conditions ("Terms") govern your access to and use of the SkyTron<sup>®</sup> mobile application
            ("App"). By downloading, installing, or using the App, you agree to be bound by these Terms. If you do not
            agree, please do not use the App.
          </Typography>
        </Box>

        {/* Sections */}
        <Box sx={{
          '& .MuiAccordion-root': {
            mb: 1,
            borderRadius: '8px !important',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            '&:before': { display: 'none' }
          }
        }}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>1. Acceptance of Terms</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                By accessing and using SkyTron<sup>®</sup>, you acknowledge that you have read, understood, and agree to comply
                with these Terms. These Terms apply to all users, including those who register an account or use the App
                without an account.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>2. Eligibility</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                You must be at least 18 years old to use this App. By using SkyTron<sup>®</sup>, you represent that you have the legal
                capacity to enter into this agreement.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>3. Use of the App</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, color: bodyTextColor }}>
                - You agree to use the App only for lawful purposes and in accordance with these Terms.<br />
                - You shall not misuse, exploit, or interfere with the functionality, security, or integrity of the App.<br />
                - Unauthorized access, reverse engineering, or data extraction from the App is strictly prohibited.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>4. Permissions Required</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ mb: 2, color: bodyTextColor }}>
                To provide the best experience, the App may request the following permissions:
              </Typography>

              <ul style={{ paddingLeft: '20px', listStyleType: 'disc', margin: 0 }}>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor }}>
                    <strong>Camera Access</strong> – Required for capturing driver photos for identification and verification for vehicle owner.
                  </Typography>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Location Access</strong> – Used for real-time vehicle tracking and navigation:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Precise Location (GPS)</strong> – Required for accurate tracking of driver and vehicle location by vehicle owner or Police/ambulance.
                      </Typography>
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Approximate Location</strong> – Used for general location-based features.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Background Location</strong> – Needed for tracking even when the app is not in use, ensuring uninterrupted service.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Storage Access</strong> – Allows saving and retrieving files and media within the app:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Read Storage</strong> – To access images and media files.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Write Storage</strong> – To store downloaded alerts.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Network & Internet Access</strong> – Ensures connectivity for real-time data exchange and MQTT communication:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Internet Access</strong> – Required for cloud-based operations and data synchronization.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Network Status Check</strong> – Ensures stable network connectivity for uninterrupted service.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Bluetooth Access</strong> – Enables communication with external devices, such as vehicle tracking hardware for guest user:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Connect to Bluetooth Devices</strong> – Required for pairing with IoT and tracking devices.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Scan for Bluetooth Devices</strong> – To detect and establish connections with Vehicle Tracking devices.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Foreground Services</strong> – Used for critical app functions such as continuous tracking and data sync for vehicle owner alerts and Police/Ambulance SOS alerts:
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Data Sync</strong> – Ensures real-time MQTT-based location updates and server communication for vehicle owner alerts and Police/Ambulance SOS alerts.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Location Services</strong> – Enables background and foreground tracking for seamless monitoring.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li style={{ marginBottom: '15px' }}>
                  <Typography variant="body2" sx={{ color: bodyTextColor }}>
                    <strong>Notifications Access</strong> – Allows the app to send important alerts and updates regarding trip status, driver updates, SOS alerts and system messages.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" sx={{ color: bodyTextColor, mb: 1 }}>
                    <strong>Device & System Access:</strong>
                  </Typography>
                  <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Auto-start on Reboot</strong> – Ensures essential services (such as tracking) resume automatically after a device restart.
                      </Typography>
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Wake Lock</strong> – Prevents the device from sleeping during critical operations, such as continuous location tracking.
                      </Typography>
                    </li>
                    <li style={{ marginBottom: '6px' }}>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>App License Verification</strong> – Ensures the authenticity of the app and prevents unauthorized usage.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ color: bodyTextColor }}>
                        <strong>Internal App Functionality</strong> – Supports secure internal communication and processing within the app.
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ul>

              <Typography variant="body2" sx={{ mt: 2, color: bodyTextColor }}>
                These permissions will be requested explicitly, and you can manage them via your device settings.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>5. User Accounts</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, color: bodyTextColor }}>
                - You may be required to create an account to access certain features.<br />
                - You are responsible for maintaining the confidentiality of your account credentials.<br />
                - We reserve the right to suspend or terminate your account if we detect any unauthorized activity.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>6. Privacy Policy</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                Our Privacy Policy governs how we collect, use, and protect your personal information. By using SkyTron<sup>®</sup>,
                you acknowledge and accept our Privacy Policy.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>7. Intellectual Property</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, color: bodyTextColor }}>
                - All content within the App, including text, graphics, trademarks, logos, and software, is owned or licensed
                by us and protected under applicable copyright and trademark laws.<br />
                - You may not copy, modify, distribute, or create derivative works from any content without our prior
                written consent.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>8. Third-Party Services</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                SkyTron<sup>®</sup> may integrate with third-party services, and we are not responsible for their terms, policies, or
                actions. Your use of third-party services is at your own risk.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>9. Limitation of Liability</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', lineHeight: 1.7, color: bodyTextColor }}>
                - We provide the App on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind.<br />
                - We are not responsible for any direct, indirect, incidental, or consequential damages arising from the use or
                inability to use the App.<br />
                - We do not guarantee uninterrupted, error-free operation of the App.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>10. Termination</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                We reserve the right to suspend or terminate your access to the App at our discretion, without notice, if we
                determine that you have violated these Terms or engaged in unlawful activity.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>11. Governing Law & Dispute Resolution</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                These Terms shall be governed by the laws of India. Any disputes shall be resolved in the courts of Guwahati,
                Assam, India.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>12. Modifications to the Terms</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '1rem', color: bodyTextColor }}>
                We reserve the right to update these Terms at any time. Changes will be effective upon posting within the
                App. Continued use after modifications constitutes acceptance of the new Terms.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ borderRadius: '8px !important', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: brandBlue }}>13. Contact Information</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box sx={{ py: 2 }}>
                <Typography variant="body2" sx={{ color: bodyTextColor }}>
                  For any questions or concerns regarding these Terms, please contact us at{' '}
                  <a href="mailto:support@skytron.in" style={{ color: brandBlue, fontWeight: 700, textDecoration: 'none' }}>
                    support@skytron.in
                  </a>
                </Typography>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>
    </Box>
  );
}

export default PrivacyPolicy;
