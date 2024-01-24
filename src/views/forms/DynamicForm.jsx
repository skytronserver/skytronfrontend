import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
const DynamicForm = ({ fieldConfig, initialData, formTitle }) => {
  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
  };

  const validationSchema = Yup.object(
    Object.keys(fieldConfig).reduce((acc, field) => {
      acc[field] = fieldConfig[field].validation;
      return acc;
    }, {})
  );
  const handleCreateUser = async (userData) => {
    try {
      const response = await UserServices.registerUser(userData);
      console.log("User created successfully:", response.data);
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error creating user:", error.message);
      return { code: "400", message: error.message };
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const valuesWithRole = {
      ...values,
      role: "stateadmin",
      status: "deactive",
    };
    delete valuesWithRole.kycfile;
    delete valuesWithRole.panfile;
    console.log(valuesWithRole);
    const response = await handleCreateUser(valuesWithRole);
    if (response.code === "200") {
      alert("Form submitted successfully!");
      setSubmitting(false);
      resetForm(initialData);
    } else {
      alert(`Form was not submitted`);
      console.error(response.message);
    }
  };

  return (
    <Grid container spacing={gridSpacing}>
      <Grid item xs={12}>
        <PageHeader title={formTitle} />
      </Grid>
      <Grid item xs={12}>
        <MainCard title="Registration Form">
          <Formik
            initialValues={initialData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(fieldConfig).map((field) => (
                    <Grid key={field} item md={6} sm={12} xs={12}>
                      <FormField
                        fieldConfig={fieldConfig[field]}
                        formik={formik}
                        handleFileChange={handleFileChange}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12} style={{ marginTop: "20px" }}>
                    <Button type="submit" variant="contained" color="primary">
                      Submit
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default DynamicForm;
