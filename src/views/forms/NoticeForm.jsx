import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import {
  gridSpacing,
  FILE_SIZE,
  SUPPORTED_FORMATS,
} from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import Notice from "../../services/Notice";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formFields, initialValues } from "../../formjson/notice";
import { useParams } from "react-router-dom";
import "./form.css";
const NoticeForm = () => {
  const params = useParams();
  const parameter= params['*'] && !isNaN(params['*'])
  const [editPage,setEditPage]=useState(false);
  const [open, setOpen] = useState(false);
  const [noticeInitialValues, setNoticeInitialValues] = useState(initialValues);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    if(params['*'] && !isNaN(params['*'])){
      const id=params['*']; 
      (async()=>{
        try {
          const responseData=await Notice.filter({notice_id:id});
          if(responseData?.data?.[0]){
            const response=responseData?.data?.[0];
            setNoticeInitialValues({
              title: response.title,
              detail: response.detail,
              file: response.file,
              status: response.status,
              id:response.id
            });
            setEditPage(true);
          }
        } catch (error) {
          console.log(error)
        }
      })()
    }else{
      setNoticeInitialValues(initialValues);
      setEditPage(false);
    }
  },[parameter]);

  const handleClose = () => {
    !alert.error && navigate("/setting/notice");
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
    formik.setFieldError(fieldName, errors[fieldName]);
  };

  const validationSchema = Yup.object(
    Object.keys(formFields).reduce((acc, field) => {
      acc[field] = formFields[field].validation;
      return acc;
    }, {})
  );
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userData = sessionStorage.getItem("cookiesData");
      const data = userData && userData.split("-");
      const userId = userData && data.length > 2 && data[3];

      const valuesWithRole = {
        ...values,
        createdby: userId,
      };
      setSubmitting(true);
      setLoading(true);
      const message="Notice added successfully"
      if(editPage){
        message="Notice Updated successfully"
        await Notice.update(valuesWithRole);
      }else{
        await Notice.create(valuesWithRole);  
      } 
      
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(message);
      resetForm(noticeInitialValues);
    } catch (error) {
      // Handle error response
      console.error("Error adding notice:", error?.message);
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error?.message,
          errors: error?.response?.data,
        },
      }));
      handleAlert("Something went wrong");
    } finally {
      setSubmitting(false);
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
          <div className="spinner-div">
            <CircularProgress className="circular-progress" size={50} />
          </div>
        )}
        <Grid item xs={12} className={loading ? "loading" : "not-loading"}>
          <MainCard title="New Notice">
            <Formik
              initialValues={noticeInitialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={2} className="form-controller">
                    {Object.keys(formFields).map((field) => (
                      <Grid key={field} item md={6} sm={12} xs={12}>
                        <FormField
                          fieldConfig={formFields[field]}
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
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default NoticeForm;
