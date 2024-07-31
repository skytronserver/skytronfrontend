import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeviceModelServices from "../../services/DeviceModelServices";
import DealerServices from "../../services/DealerServices";
import CustomLoader from "../../ui-component/CustomLoader";
import {assignDeviceFormFields,assignDeviceInitials} from  "../../formjson/assignDevice";
const AssignDevice = () => {
  const [updatedFormFields,setUpdatedFormField]=useState(assignDeviceFormFields);
  const [isFormLoaded,setIsFormLoaded]=useState(false);
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleClose = () => {
    setOpen(false);
  };

  //Changes from here
  const retriveModelList = async () => {
    try {
      const response = await DeviceModelServices.getDeviceList();
      const list=response.data.data.map(device => ({
        value: device.id,
        label: device.imei,
      })); 
      return list;
    } catch (error) {
      if (error.response && error.response.status === 404) {
       console.log('No Data Found')
      } else {
        console.log('No Data Found')
      }
      return [{value:'',label:'Unable to fetch'}]
    }
  };
  const retriveDealerList=async()=>{
      try{
          const res=await DealerServices.dealerList();
          if(res.data.length===0){
            return [{value:'',label:'No Approved Dealer'}]
          }
          const filtered=res.data.filter((item)=>item.users[0].status==='active');
          const arrayList=filtered.map(dealer=>({
              value:dealer.id,
              label:dealer.company_name,
          }));

          return arrayList;
      }catch(error){
          if (error.response && error.response.status === 404) {
              console.log('No Data Found')
             } else {
               console.log('No Data Found')
             }
      }
  }
  useEffect(()=>{
    (async()=>{
     const modelList=await retriveModelList();
     const dealerList=await retriveDealerList();
    setUpdatedFormField(prevConfig =>({
      ...prevConfig,
      dealer:{
        ...prevConfig.dealer,
        options: dealerList,
      },
      device:{
        ...prevConfig.device,
        options: modelList,
      }
    }))
    setIsFormLoaded(true)
    }
  )()
  },[])
//Changes till here

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
    try {
      const response = await DealerServices.assignDeviceToDealer(values);
      setDeviceId(response.data.id);
      setLoading(false);
      resetForm(assignDeviceInitials);
    } catch (error) {
      console.error("Error :", error.message);
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
        {loading && <CustomLoader />}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title="Assign Device to Retailer">
              { isFormLoaded && <Formik
                initialValues={assignDeviceInitials}
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

export default AssignDevice;
