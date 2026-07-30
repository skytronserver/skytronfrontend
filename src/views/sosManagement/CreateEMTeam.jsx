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
import { retriveSOSLead, retriveSOSMember, retriveStateList } from "../../helper";
import "../forms/form.css";
import { emTeamFormField, emTeamInitialValues } from "../../formjson/sosUser";
import { useTranslation } from "react-i18next";

const CreateEMTeam = () => {
  const { t } = useTranslation();
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
      const sosLead = await retriveSOSLead();
      const sosTeam = await retriveSOSMember();
      setUpdatedFormField((prevConfig) => ({
        ...prevConfig,
        state: {
          ...prevConfig.state,
          options: stateList,
          value: stateList?.[0]?.label || '',
          id: stateList?.[0]?.value || '',
        },
        teamlead: {
          ...prevConfig.teamlead,
          options: sosLead
        },
        members: {
          ...prevConfig.members,
          options: sosTeam
        }
      }));
      
      // Update initial values to include the prefilled state label
      if (stateList?.[0]) {
        setEmInitialValues(prev => ({
          ...prev,
          state: stateList[0].label,
          stateId: stateList[0].value // Store ID separately
        }));
      }
      
      setIsFormLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (params["*"] && !isNaN(params["*"])) {
      const id = params["*"];
      (async () => {
        try {
          const responseData = await SOSManagement.viewEmTeam({ team_id: id });
          if (responseData?.data?.team) {
            const team = responseData.data.team;
            
            // Get the team lead user info
            const teamLeadUser = team.teamlead?.users?.[0];
            
            // Get the member users info
            const memberUsers = team.members?.map(member => ({
              id: member.id,
              name: member.users?.[0]?.name,
              email: member.users?.[0]?.email
            }));

            setEmInitialValues({
              name: team.name || '',
              detail: team.detail || '',
              state: team.state?.state || '', // State name from nested state object
              teamlead: team.teamlead?.id?.toString() || '', // Team lead ID as string
              members: [team.members?.[0]?.id?.toString()] || [], // Take first member's ID as string
              team_id: team.id?.toString(), // Add team_id for edit mode
              id: team.id,
            });
            setEditPage(true);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      // For new team creation, check if we have state list loaded and prefill
      if (updatedFormFields.state?.options?.length > 0) {
        setEmInitialValues(prev => ({
          ...emTeamInitialValues,
          state: updatedFormFields.state.options[0].label,
          stateId: updatedFormFields.state.options[0].value
        }));
      } else {
        setEmInitialValues(emTeamInitialValues);
      }
      setEditPage(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter, updatedFormFields.state?.options]);

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
      
      // Find the state ID based on selected state label
      const selectedState = updatedFormFields.state.options.find(
        option => option.label === values.state
      );
      
      // Prepare API payload with state ID
      const payload = {
        ...values,
        state: selectedState?.value || values.state, // Use ID for API
        teamlead: values.teamlead?.toString(), // Ensure teamlead is string
        members: values.members?.map(id => id.toString()), // Ensure member IDs are strings
      };

      let message = t("emTeamForm.messages.teamAdded");
      let response;

      if (editPage) {
        message = t("emTeamForm.messages.teamUpdated");
        // Add team_id to payload for edit mode
        payload.team_id = values.team_id || values.id?.toString();
        response = await SOSManagement.editEmTeam(payload);
      } else {
        response = await SOSManagement.createEmTeam(payload);
      }

      if (response) {
        setAlert((prevAlert) => ({
          ...prevAlert,
          error: false,
          errorList: [],
        }));
        handleAlert(message);
        if (!editPage) {
          resetForm(emInitialValues);
        } else {
          navigate("/new/em-team");
        }
      }
    } catch (error) {
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: {
          code: "400",
          message: error.message,
          errors: error.response?.data?.error,
        },
      }));
      const message = error.response?.data?.error !== "" ? ` ${t("common.reason")}: ${error.response?.data?.error}` : "";
      handleAlert(t("common.formNotSubmitted") + message);
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
          <MainCard title={editPage ? t("emTeamForm.editTitle") : t("emTeamForm.title")}>
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
                          {t("common.submit")}
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
