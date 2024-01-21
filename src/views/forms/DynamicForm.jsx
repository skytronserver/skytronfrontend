import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
const DynamicForm = ({fieldConfig,initialData,formTitle}) => {
    const handleFileChange = (event, formik) => {
      const selectedFile = event.target.files[0];
      const fieldName=event.target.name;
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
  
    const handleSubmit = (values, { setSubmitting }) => {
      console.log("Form values:", values);
      setTimeout(() => {
        alert("Form submitted successfully!");
        setSubmitting(false);
      }, 1000);
    };
  
    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title={formTitle} />
        </Grid>
        <Grid item xs={12}>
          <MainCard title="Registration Form">
            <Formik initialValues={initialData} validationSchema={validationSchema} onSubmit={handleSubmit} enableReinitialize>
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} className="form-controller">
                {Object.keys(fieldConfig).map((field) => (             
                  <Grid key={field} item md={6} sm={12} xs={12}>
                    <FormField fieldConfig={fieldConfig[field]} formik={formik} handleFileChange={handleFileChange}/>
                  </Grid>
                ))}
                  <Grid item xs={12} style={{marginTop:"20px"}}>
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