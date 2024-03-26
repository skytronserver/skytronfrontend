import { Grid, Button,CircularProgress  } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DeviceModelServices from "../../services/DeviceModelServices";
import StockServices from "../../services/StockServices";
import { convertErrorObjectToArray } from "../../helper";
const currentDate = new Date();
const formattedCurrentDate = currentDate.toISOString().split('T')[0]; 
const DeviceForm = ({ fieldConfig, initialData, formTitle }) => {
  const [open, setOpen] = useState(false);
  const [alert,setAlert]=useState({
    error:false,
    message:'',
    errorList:[]
  })
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert)=>({...prevAlert,message:message}))
    setOpen(true);
  };
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
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const valuesWithRole = {
      ...values,
      created:formattedCurrentDate,
      createdby:'31'
    };

    console.log(valuesWithRole);
    try {
      const response = await StockServices.createStock(values);
      console.log(response)
      setLoading(false);
      resetForm(initialData);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };
  const handleModelChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName == "model") {
      console.log(event.target.value);
      (async () => {
        const getDetailsOf = {
          device_model_id: event.target.value,
        };
        try {
          const retrieveData = await DeviceModelServices.getModel(getDetailsOf);
          console.log(retrieveData.data);

          formik.setFieldValue("test_agency", retrieveData.data.test_agency);
          formik.setFieldValue("tac_no", retrieveData.data.tac_no);
          formik.setFieldValue("tac_validity", retrieveData.data.tac_validity);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log("Data not found");
          } else {
            console.log("An error occurred while fetching data");
          }
        }
      })();
    }
  };
  return (
    <>
    <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList}/>
    
    <Grid container spacing={gridSpacing} >
     
      {loading && (
        <div style={{ top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "rgba(255, 255, 255, 0.8)" }}>
          <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} size={50} />
        </div>
      )}
      <Grid item xs={12} style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s ease-in-out"}}>
        <MainCard title="Device Details">
          <Formik
            initialValues={initialData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit} >
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(fieldConfig).map((field) => (
                    <Grid key={field} item md={4} sm={12} xs={12}>
                      <FormField
                        fieldConfig={fieldConfig[field]}
                        formik={formik}
                        handleFileChange={handleFileChange}
                        handleOptionChange={handleModelChange}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12} style={{ marginTop: "20px" }}>
                    <Button type="submit" variant="contained" color="primary"  disabled={loading}>
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
    </>
  );
};

export default DeviceForm;
