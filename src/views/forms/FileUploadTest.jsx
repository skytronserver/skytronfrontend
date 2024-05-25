import React, { useState } from "react";
import { TextField, Button, Typography, Container, Grid } from "@mui/material";
import FileUpload from "../../services/FileUpload";

const FileUploadTest = () => {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePhotoChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("file", file);

      // Make API request with formData using fetch or Axios
      // Example using fetch:
      const response = await FileUpload.copUpload(formData);

      // Handle the response as needed


      // Reset the form
      setEmail("");
      setFile(null);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Container>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={12}>
          <Typography variant="h5" align="center">
            Multipart Form
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={handleEmailChange}
          />
        </Grid>
        <Grid item xs={12}>
          <input
            type="file"
            accept=".pdf, .png, .jpg, .jpeg"
            onChange={handlePhotoChange}
            style={{ marginBottom: "16px" }}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FileUploadTest;
