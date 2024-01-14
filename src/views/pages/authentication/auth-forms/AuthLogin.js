import {
  Box,
  Button,
  FormHelperText,
  Grid,
  Stack,
  Typography,
  TextField
} from "@mui/material";
// third party
import * as Yup from "yup";
import { Formik, useFormik, Form } from "formik";
import AnimateButton from "../../../../ui-component/extended/AnimateButton";
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from "../../../../actions/loginActions";
const FirebaseLogin = ({ ...others }) => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.login.loading);
  const error = useSelector((state) => state.login.error);
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
    console.log("Form values:", values);
    // Simulate an asynchronous operation (e.g., API call)
    dispatch(loginUser(values.email, values.password));
    // setTimeout(() => {
    //   alert("Form submitted successfully!");
    //   setSubmitting(false);
    // }, 1000);
  };
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: handleSubmit,
  });
  return (
    <>
      <Grid container direction="column" justifyContent="center" spacing={2}>
        <Grid
          item
          xs={12}
          container
          alignItems="center"
          justifyContent="center"
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">
              Sign in with your Email Address
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Formik
        initialValues={formik.initialValues}
        onSubmit={formik.handleSubmit}
      >
        <Form>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                {...formik.getFieldProps("email")}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                type="password"
                margin="normal"
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
            </Grid>
          </Grid>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
          >
            <Typography
              variant="subtitle1"
              color="secondary"
              sx={{ textDecoration: "none", cursor: "pointer" }}
            >
              Forgot Password?
            </Typography>
          </Stack>
          {formik.errors.submit && (
            <Box sx={{ mt: 3 }}>
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            </Box>
          )}

          <Box sx={{ mt: 2 }}>
            <AnimateButton>
              <Button
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                color="secondary"
              >
                Sign in
              </Button>
            </AnimateButton>
          </Box>
        </Form>
      </Formik>
    </>
  );
};

export default FirebaseLogin;
