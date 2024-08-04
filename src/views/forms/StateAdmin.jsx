import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MainCard from "../../ui-component/cards/MainCard";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import DialogComponent from "../../ui-component/DialogComponent";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertErrorObjectToArray,retriveStateList } from "../../helper";
import {stateAdminInitialValues,stateAdminField} from "../../formjson/stateAdmin"
import { FILE_SIZE,SUPPORTED_FORMATS,gridSpacing } from "../../store/constant";
const StateAdmin = () => {
  const [updatedFormFields,setUpdatedFormField]=useState(stateAdminField);
  const [isFormLoaded,setIsFormLoaded]=useState(false)
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const userData=sessionStorage.getItem('cookiesData');
  const navigate = useNavigate();
  useEffect(()=>{
    (async()=>{
    const stateList=await retriveStateList();
    setUpdatedFormField(prevConfig =>({
      ...prevConfig,
      state: {
        ...prevConfig.state,
        options: stateList,
      },
    }))
    setIsFormLoaded(true)
    }
  )()
  },[])
 
  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.currentTarget.files[0];
    const fieldName = event.target.name;
    const errors = {};
    if (selectedFile) {
      if (selectedFile.size > FILE_SIZE) {
        errors[fieldName] = "File too large. Max size is 512KB";
      } else if (!SUPPORTED_FORMATS.includes(selectedFile.type)) {
        errors[fieldName] = "Unsupported Format";
      } else {
        formik.setFieldValue(fieldName, selectedFile);
        return;
      }
    }
    formik.setFieldError(fieldName, errors.file_idProof);
  };
  
  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    const data=userData && userData.split("-")
    const userId=userData && data.length > 2 && data[3];
    let valuesWithRole = {};
    valuesWithRole = {
        ...values,
        role: "stateadmin",
        createdby: userId,
      };
    try {
      await UserServices.createStateAdmin(valuesWithRole);
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
      resetForm(stateAdminInitialValues);
    } catch (error) {
      if(error.message==='Network Error'){
        handleAlert("Internal Server Error");
        return true
      }
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(error.response.data,),
      }));
      handleAlert("Form Not Submitted");
    }finally{
      setLoading(false);
    }
  };

  return (
    <>
      <DialogComponent
        open={open}
        handleClose={handleClose}
        message={alert.message}
        errorList={alert.errorList}
      />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              background: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <CircularProgress
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              size={50}
            />
          </div>
        )}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Create State Admin">
            {isFormLoaded && <Formik
              initialValues={stateAdminInitialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(updatedFormFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={updatedFormFields[field]}
                          formik={formik}
                          handleFileChange={handleFileChange}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ marginTop: "20px" }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        Submit
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
            }
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default StateAdmin;
