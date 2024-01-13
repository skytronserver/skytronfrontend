// material-ui
import { Typography, Grid } from "@mui/material";
// project imports
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";

import { Formik, Form, Field } from "formik";
import { TextField, Button } from "@mui/material";
import FileUpload from "../../utils/FileUpload";
const NewUser = () => {
  const initialValues = {
    name: "",
    mobile: "",
    email: "",
    companyName: "",
    gstNo: "",
    idProofNo: "",
  };

  const handleSubmit = (values) => {
    // Handle form submission logic here
    console.log(values);
  };
  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title="State" />
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={gridSpacing}>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <MainCard title="New User">
              <Formik initialValues={initialValues} onSubmit={handleSubmit}>
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field
                        name="name"
                        as={TextField}
                        label="Name"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="mobile"
                        as={TextField}
                        label="Mobile No"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="email"
                        as={TextField}
                        label="Email Address"
                        type="email"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="companyName"
                        as={TextField}
                        label="Company Name"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="gstNo"
                        as={TextField}
                        label="GST No"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        name="idProofNo"
                        as={TextField}
                        label="Id Proof Number"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FileUpload placeholder="ID PROOF" />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary">
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              </Formik>
            </MainCard>
          </Grid>
          <Grid item lg={6} md={6} sm={6} xs={12}>
            <MainCard title="Users">
              <Typography variant="body2">......</Typography>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default NewUser;
