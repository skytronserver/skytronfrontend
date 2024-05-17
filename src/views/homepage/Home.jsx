import React from "react";
import {
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Box,
FormHelperText,
} from "@mui/material";
import * as Yup from "yup";
import { Formik, useFormik, Form } from "formik";
import { useDispatch,useSelector} from 'react-redux';
import { loginUser } from "../../actions/loginActions";
import skytronlogo from '../../assets/images/skytron-logo.png';
import { Navigate } from "react-router-dom";
function Home() {
  const dispatch = useDispatch();
  const initialValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(loginUser(values.email, values.password));
  };
   const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });
  const isAuthenticated = useSelector(
    (state) => state.login.user.isAuthenticated
  );
  const otpId=useSelector((state)=>state.login.user.otpToken);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  if(otpId!=null){
    return <Navigate to="/otp-login" replace />;
  }
  return (
    <Container sx={{ mt: 4 }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "70vh" }}
      >
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: { xs: "none", md: "block" } }}
        ></Grid>
        <Grid
          item
          xs={12}
          md={4}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Paper
            sx={{
              p: 2,
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
            <img
        src={skytronlogo}
        alt="logo"
        style={{ height: 'auto', width: '36px' }}
      /><br/>
      <span style={{color: "#430A5D", fontfamily:"Quantico",fontWeight:"900px",fontSize:"15px",textshadow: "2px 2px 4px"}}>SKYTRON</span>

            </Typography>
            <Formik
        initialValues={formik.initialValues}
        onSubmit={formik.handleSubmit}
      >
        <Form>
              <TextField
                id="email"
                label="Email"
                name="email"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ backgroundColor: "none" }}
                {...formik.getFieldProps("email")}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <TextField
                id="password"
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                name="password"
                margin="normal"
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
              {formik.errors.submit && (
            <Box sx={{ mt: 3 }}>
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            </Box>
          )}

              <Button variant="contained" color="primary"  type="submit" fullWidth>
                Login
              </Button>
              </Form>
      </Formik>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;