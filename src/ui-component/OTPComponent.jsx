import { Grid, Button, Typography } from "@mui/material";
import { MuiOtpInput } from "mui-one-time-password-input";
const OTPComponent = ({otp,handleChange,handleOTPSubmit}) => {
  return (
    <Grid
    container
    spacing={2}
    justifyContent="center"
    alignItems="center"
  >
    <Grid item xs={12} md="5">
      <MuiOtpInput value={otp} onChange={handleChange} length={6} />
      <br />
      <Typography align="center">
        <Button
          color="primary"
          size="large"
          type="submit"
          variant="contained"
          onClick={handleOTPSubmit}
        >
          Verify OTP
        </Button>
      </Typography>
    </Grid>
  </Grid>
  )
}

export default OTPComponent