import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
} from "@mui/material";


//import emailjs from "@emailjs/browser";
//import { toast, ToastContainer } from "react-toastify";
//import "react-toastify/dist/ReactToastify.css";

const Contact = () => {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [emailError, setEmailError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [messageError, setMessageError] = useState(false);

  const handleForm = (field, value) => {
    if (field === "email") {
      setEmail(value);
      setEmailError(false);
    }
    if (field === "subject") {
      setSubject(value);
      setSubjectError(false);
    }
    if (field === "message") {
      setMessage(value);
      setMessageError(false);
    }
  };

  const sendEmail = (e) => {
    e.preventDefault();

    if (!email) setEmailError(true);
    if (!subject) setSubjectError(true);
    if (!message) setMessageError(true);

    if (!email || !subject || !message) return;

    const serviceID = "service_fpbi0yq";
    const templateId = "template_ymuawjr";
    const publicKey = "QMrpQkZRPvWobmkeo";

    const templateParam = {
      from_name: email,
      from_email: "emailjs",
      to_name: "Admin Mapwala",
      message: `Subject: ${subject}. Message: ${message}`,
    };

    // emailjs.send(serviceID, templateId, templateParam, publicKey).then(
    //   () => {
    //     toast.success("Message Sent Successfully");
    //     setEmail("");
    //     setSubject("");
    //     setMessage("");
    //   },
    //   () => {
    //     toast.error("Server Side Error. Try Again Later");
    //   }
    // );
  };

  return (
    <Box sx={{ background: "#f4f6f8", minHeight: "100vh" }}>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Heading */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Contact Us
          </Typography>
          <Typography color="text.secondary" maxWidth={700} mx="auto">
            Ready to take the next step? Reach out to our team for more
            information or to discuss your project requirements.
          </Typography>
        </Box>

        {/* Main Section */}
        <Grid container spacing={4}>
          {/* FORM */}
          <Grid item xs={12} md={7}>
            <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
              <Typography variant="h5" mb={3} fontWeight="600">
                Send Message
              </Typography>

              <Box component="form">
                <TextField
                  fullWidth
                  label="Your Email"
                  variant="outlined"
                  margin="normal"
                  value={email}
                  error={emailError}
                  helperText={emailError && "Email is required"}
                  onChange={(e) => handleForm("email", e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Subject"
                  variant="outlined"
                  margin="normal"
                  value={subject}
                  error={subjectError}
                  helperText={subjectError && "Subject is required"}
                  onChange={(e) => handleForm("subject", e.target.value)}
                />

                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={6}
                  margin="normal"
                  value={message}
                  error={messageError}
                  helperText={messageError && "Message is required"}
                  onChange={(e) => handleForm("message", e.target.value)}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: "bold",
                  }}
                  onClick={sendEmail}
                >
                  Send Message
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* CONTACT INFO */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                background: "#1976d2",
                color: "#fff",
                height: "100%",
              }}
            >
              <Typography variant="h5" fontWeight="600" mb={2}>
                Reach Us
              </Typography>

              <Typography mb={2}>
                PreciTrack Mapwala Private Limited
              </Typography>

              <Typography mb={1}>
                2, Civil Lines Enclave, Civil Lines
              </Typography>

              <Typography mb={3}>Gurgaon 122001</Typography>

              <Divider sx={{ bgcolor: "#ffffff50", mb: 3 }} />

              <Typography mb={1}>Mon - Fri: 09:00 – 18:00</Typography>
              <Typography mb={1}>Saturday: 08:00 - 15:00</Typography>
              <Typography mb={2}>Sunday: Closed</Typography>

              <Typography>
                Email:{" "}
                <Box component="span" sx={{ fontWeight: "bold" }}>
                  harish@mapwala.in
                </Box>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

    </Box>
  );
};

export default Contact;