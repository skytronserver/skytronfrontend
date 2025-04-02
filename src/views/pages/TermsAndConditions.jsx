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

        <Typography
          variant="subtitle1"
          sx={{ textAlign: "center", marginBottom: 4 }}
        >
          Last Updated: 02.04.2025
        </Typography>

        <Typography variant="body1" paragraph>
          Welcome to SkyTron, an intelligent vehicle tracking and safety platform developed by AMTRON 
          in collaboration with Skytrack Technologies Private Limited ("Company," "we," "us," or "our"). 
          It enables real-time monitoring, safety alerts, and compliance for public transport and 
          emergency services under the Nirbhaya framework.
        </Typography>

        <Typography variant="body1" paragraph sx={{ mb: 4 }}>
          These Terms and Conditions ("Terms") govern your access to and use of the SkyTron mobile 
          application ("App"). By downloading, installing, or using the App, you agree to be bound 
          by these Terms. If you do not agree, please do not use the App.
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
            <Typography variant="h6">4. Permissions Required</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              To provide the best experience, the App may request the following permissions:
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Camera Access
            </Typography>
            <Typography variant="body1" paragraph>
              Required for capturing driver photos for identification and verification for vehicle owner.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Location Access
            </Typography>
            <Typography variant="body1" paragraph>
              Used for real-time vehicle tracking and navigation:
            </Typography>
            <ul>
              <li>Precise Location (GPS) – Required for accurate tracking of driver and vehicle location by vehicle owner or Police/ambulance.</li>
              <li>Approximate Location – Used for general location-based features.</li>
              <li>Background Location – Needed for tracking even when the app is not in use, ensuring uninterrupted service by Police/Ambulance.</li>
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Storage Access
            </Typography>
            <Typography variant="body1" paragraph>
              Allows saving and retrieving files and media within the app:
            </Typography>
            <ul>
              <li>Read Storage – To access images and media files for Driver photo.</li>
              <li>Write Storage – To store downloaded alerts.</li>
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Network & Internet Access
            </Typography>
            <Typography variant="body1" paragraph>
              Ensures connectivity for real-time data exchange and MQTT communication:
            </Typography>
            <ul>
              <li>Internet Access – Required for cloud-based operations and data synchronization of Skytron.</li>
              <li>Network Status Check – Ensures stable network connectivity for uninterrupted service for Vehicle Owner and Police/Ambulance.</li>
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Bluetooth Access
            </Typography>
            <Typography variant="body1" paragraph>
              Enables communication with external devices, such as vehicle tracking hardware for guest user:
            </Typography>
            <ul>
              <li>Connect to Bluetooth Devices – Required for pairing with IoT and tracking devices by guest user.</li>
              <li>Scan for Bluetooth Devices – To detect and establish connections with Vehicle Tracking devices.</li>
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Foreground Services
            </Typography>
            <Typography variant="body1" paragraph>
              Used for critical app functions such as continuous tracking and data sync for vehicle owner alerts and Police/Ambulance to provide emergency assistance to accident vehicle:
            </Typography>
            <ul>
              <li>Data Sync – Ensures real-time MQTT-based location updates and server communication for vehicle owner alerts and Police/Ambulance to provide emergency assistance to accident vehicle.</li>
              <li>Location Services – Enables background and foreground tracking for seamless monitoring of accident vehicles by Police/Ambulance.</li>
            </ul>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Notifications Access
            </Typography>
            <Typography variant="body1" paragraph>
              Allows the app to send important alerts and updates regarding trip status, driver updates, SOS alerts and system messages.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>
              Device & System Access
            </Typography>
            <ul>
              <li>Auto-start on Reboot – Ensures essential services (such as tracking) resume automatically after a device restart.</li>
              <li>Wake Lock – Prevents the device from sleeping during critical operations, such as continuous location tracking of accident vehicles and alerts.</li>
              <li>App License Verification – Ensures the authenticity of the skytron app and prevents unauthorized usage.</li>
              <li>Internal App Functionality – Supports secure internal communication and processing within the skytron app.</li>
            </ul>

            <Typography variant="body1" sx={{ mt: 2 }}>
              These permissions will be requested explicitly, and you can manage them via your device settings.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">5. User Roles</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" paragraph>
              SkyTron® supports multiple user roles, each with specific permissions and responsibilities:
            </Typography>
            <ul>
              <li>Vehicle Owner: Can track vehicles history, monitor real-time tracking, check reports and receive alerts.</li>
              <li>Police/ Ambulance: Monitors emergency alerts, accesses accident-related tracking data, and provides emergency assistance.</li>
              <li>DTO/RTO (District Transport Officer/Regional Transport Officer): Regulates vehicle compliance, fitment of tracking devices, and transport safety measures.</li>
              <li>Guest User: Limited access to basic features, Bluetooth connectivity for vehicle hardware, and public safety notifications and create emergency alerts.</li>
            </ul>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">6. Privacy Policy</Typography>
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
            <Typography variant="h6">7. Intellectual Property</Typography>
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
            <Typography variant="h6">8. Third-Party Services</Typography>
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
            <Typography variant="h6">9. Limitation of Liability</Typography>
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
            <Typography variant="h6">10. Termination</Typography>
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
            <Typography variant="h6">11. Governing Law & Dispute Resolution</Typography>
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
            <Typography variant="h6">12. Modifications to the Terms</Typography>
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
            <Typography variant="h6">13. Contact Information</Typography>
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