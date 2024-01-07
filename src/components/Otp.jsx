import React from "react";
import { MuiOtpInput } from "mui-one-time-password-input";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
function Otp() {
  const [otp, setOtp] = React.useState("");

  const handleChange = (newValue) => {
    setOtp(newValue);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(otp);
  };
  return (
    <Container component="main" maxWidth="xs">
      <Grid
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: "100vh" }}
      >
        <Card sx={{ minWidth: 275 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              OTP
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <MuiOtpInput value={otp} onChange={handleChange} />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Submit OTP
              </Button>
              <Grid container>
                <Grid item>{"Resend OTP in 60 seconds"}</Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Container>
  );
}

export default Otp;
