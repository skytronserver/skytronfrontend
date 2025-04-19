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
import { useTranslation } from 'react-i18next';
import AnimateButton from "../../../../ui-component/extended/AnimateButton";
import { useDispatch} from 'react-redux';
import { loginUser } from "../../../../actions/loginActions";
const FirebaseLogin = ({ ...others }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  
  const initialValues = {
    email: "",
    password: "",
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t("auth.invalidEmail"))
      .required(t("auth.emailRequired")),
    password: Yup.string().required(t("auth.passwordRequired")),
  });
  const handleSubmit = (values, { setSubmitting }) => {
    dispatch(loginUser(values.email, values.password));
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
              {t("auth.signInWithEmail")}
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
                label={t("auth.email")}
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
                label={t("auth.password")}
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
              {t("auth.forgotPassword")}
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
                {t("auth.signIn")}
              </Button>
            </AnimateButton>
          </Box>
        </Form>
      </Formik>
    </>
  );
};

export default FirebaseLogin;
