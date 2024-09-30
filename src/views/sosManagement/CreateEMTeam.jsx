import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import SOSManagement from "../../services/SOSManagement";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { retriveStateList } from "../../helper";
import "../forms/form.css";
import { emTeamFormField, emTeamInitialValues } from "../../formjson/sosUser";
const CreateEMTeam = () => {
  const params = useParams();
  const parameter = params["*"] && !isNaN(params["*"]);
  const [editPage, setEditPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(emTeamFormField);
  const [emInitialValues, setEmInitialValues] = useState(emTeamInitialValues);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      const stateList = await retriveStateList();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList,
        },
      }));
      setIsFormLoaded(true);
    })();
  }, []);
  useEffect(() => {
    if (params["*"] && !isNaN(params["*"])) {
      const id = params["*"];
      (async () => {
        try {
          const responseData = await SOSManagement.viewEmTeam({ team_id: id });
          if (responseData?.data?.[0]) {
            const response = responseData?.data?.[0];
            setEmInitialValues({
              name: response.name,
              detail: response.detail,
              state: response.state,
              teamlead: response.status,
              member: response.member,
              id: response.id,
            });
            setEditPage(true);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      setEmInitialValues(emTeamInitialValues);
      setEditPage(false);
    }
  }, [parameter]);
  const navigate = useNavigate();
  const handleClose = () => {
    !alert.error && navigate("/new/em-team");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
  };

  const validationSchema = Yup.object(
    Object.keys(updatedFormFields).reduce((acc, field) => {
      acc[field] = updatedFormFields[field].validation;
      return acc;
    }, {})
  );
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setSubmitting(true);
      setLoading(true);
      let message = "Team added successfully";
      if (editPage) {
        message = "Team Updated successfully";
      } else {
        const response = await SOSManagement.createEmTeam(values);
        if (response) {
          setAlert((prevAlert) => ({
            ...prevAlert,
            error: false,
            errorList: [],
          }));
          handleAlert(message);
          resetForm(emInitialValues);
        }
      }
    } catch (error) {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error.message,
          errors: error.response?.data,
        },
      }));
      handleAlert("Form Not Submitted ! ");
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
          <MainCard title="Create EM Team">
            {isFormLoaded && (
              <Formik
                initialValues={emInitialValues}
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
            )}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default CreateEMTeam;
