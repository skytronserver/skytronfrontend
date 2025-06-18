import { Grid, Button,CircularProgress  } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState,useEffect } from "react";
import DeviceModelServices from "../../services/DeviceModelServices";
import StockServices from "../../services/StockServices";
import { useNavigate } from "react-router-dom";
import {deviceInitials,deviceFormField} from "../../formjson/deviceForm";
import {retriveModelList,retriveCreatedSimProvider,filterModelList} from "../../helper";
import { useTranslation } from "react-i18next";

const currentDate = new Date();
const formattedCurrentDate = currentDate.toISOString().split('T')[0]; 
const DeviceForm = ({formTitle }) => {
  const { t } = useTranslation(['forms']);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [updatedFormFields,setUpdatedFormField]=useState(deviceFormField);
  const [isFormLoaded,setIsFormLoaded]=useState(false);
  useEffect(()=>{
    (async()=>{
    const eSimProvider = await retriveCreatedSimProvider();
    const models=await filterModelList({status:'StateAdminApproved'});
    console.log(models,'models')
    if(!models?.status){
      setUpdatedFormField(prevConfig =>({
        ...prevConfig,
        model: {
          ...prevConfig.model,
          options: models,
        }
      }))
    }
    setUpdatedFormField(prevConfig =>({
      ...prevConfig,
      esim_provider:{
        ...prevConfig.esim_provider,
        options:eSimProvider
      }
    }))
    setIsFormLoaded(true)
    }
  )()
  },[])
  const [alert,setAlert]=useState({
    error:false,
    message:'',
    errorList:[]
  })
  const [loading,setLoading]=useState(false);
  const handleClose = () => {
    setOpen(false);
  };

  const handleFileChange = (event, formik) => {
    const selectedFile = event.target.files[0];
    const fieldName = event.target.name;
    if (selectedFile) {
      formik.setFieldValue(fieldName, selectedFile);
    }
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
    const valuesWithRole = {
      ...values,
      created:formattedCurrentDate,
      createdby:'31'
    };

    try {
      const response = await StockServices.createStock(values);
      resetForm(deviceInitials);
      navigate("/device/show-device");
    } catch (error) {
      if(error?.response){
        const errorObject=error?.response?.data || '';
        const errorString = errorObject!=='' ? Object.values(errorObject).flat().join("<br>") :'';
        console.log(errorString)
        setAlert({
          error: true,
          message: t('forms:device.errorMessage'),
          errorList: errorString
        });
        setOpen(true)
      }
      console.error("Error :", error.message);
    }finally{
      setLoading(false);
    }
  };
  const handleModelChange = (event, formik) => {
    const fieldName = event.target.name;
    if (fieldName === "model") {
      (async () => {
        const getDetailsOf = {
          device_model_id: event.target.value,
        };
        try {
          const retrieveData = await DeviceModelServices.getModel(getDetailsOf);
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
        <MainCard title={t('forms:device.title')}>
          {isFormLoaded && <Formik
            initialValues={deviceInitials}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit} >
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(updatedFormFields).map((field) => (
                    <Grid key={field} item md={4} sm={12} xs={12}>
                      <FormField
                        fieldConfig={updatedFormFields[field]}
                        formik={formik}
                        handleFileChange={handleFileChange}
                        handleOptionChange={handleModelChange}
                      />
                    </Grid>
                  ))}
                  <Grid item xs={12} style={{ marginTop: "20px" }}>
                    <Button type="submit" variant="contained" color="primary"  disabled={loading}>
                      {t('forms:device.submit')}
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

export default DeviceForm;
