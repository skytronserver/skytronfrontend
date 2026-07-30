import { useSelector, useDispatch } from "react-redux";
import React from "react";
import { useEffect, useState } from "react";
import { fetchSingleUser } from "../../actions/userDataActions";
import { useParams } from "react-router-dom";
import { Grid, Button } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import PageHeader from "../../ui-component/cards/PageHeader";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import UserServices from "../../services/UserServices";
import { updateObjectValues } from "../../helper";
import { useNavigate } from "react-router-dom";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray } from "../../helper";
const UpdateForm = ({ fieldConfig, initialData, formTitle }) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [alert,setAlert]=useState({
    error:false,
    message:'',
    errorList:[]
  })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldValue, setFieldValue] = useState(initialData);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    !alert.error && navigate("/user/registeredUser");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert)=>({...prevAlert,message:message}))
    setOpen(true);
  };

  useEffect(() => {
    const retrieveSingleItem = async () => {
      try {
        const retrieveData = await UserServices.getSingleUser(userId);
        dispatch(fetchSingleUser(retrieveData.data));
        setLoading(true);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError("User not found"); // Set a specific error message for 404
        } else {
          setError("An error occurred while fetching user data");
        }
        setLoading(true);
      }
    };
    retrieveSingleItem();
  }, [dispatch, userId]);
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
  const handleUpdateUser = async (userData) => {
    try {
      const response = await UserServices.updateUser(userId, userData);
      console.log("User created successfully:");
      return { code: "200", message: response.data };
    } catch (error) {
      console.error("Error creating user:", error.message);
      return { code: "400", message: error.message,errors:error.response.data };
    }
  };
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    const valuesWithRole = {
      ...values,
      role: "stateadmin",
      status: "deactive",
      createdby:'admin'
    };
    delete valuesWithRole.kycfile;
    delete valuesWithRole.panfile;
    const response = await handleUpdateUser(valuesWithRole);
    if (response.code === "200") {
      setAlert((prevAlert)=>({...prevAlert,error:false,errorList:[]}))
      handleAlert("Form Submitted Successfully");
      setSubmitting(false);
    } else {
      setAlert((prevAlert)=>({...prevAlert,error:true,errorList:convertErrorObjectToArray(response.errors)}));
      handleAlert("Form Not Submitted");
      console.error(response.message);
    }
  };

  const users = useSelector((state) => state.users.singleUser);
  const excludedKeys = ["kycfile", "panfile"];
  useEffect(() => {
    const data = fieldValue;
    updateObjectValues(data, users, excludedKeys);
    setFieldValue({ ...fieldValue, ...data });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
  return (
    <>
      <DialogComponent open={open} handleClose={handleClose} message={alert.message} errorList={alert.errorList}/>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <PageHeader title={formTitle} />
        </Grid>
        <Grid item xs={12}>
          {loading && (
            <MainCard title="Updation Form">
              <Formik
                initialValues={fieldValue}
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
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                        >
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            </MainCard>
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default UpdateForm;
