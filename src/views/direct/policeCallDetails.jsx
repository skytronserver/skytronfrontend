/* eslint-disable no-unused-vars */
// material-ui
import React from "react";
// project imports
import { gridSpacing } from "../../store/constant";
import { Button, Grid } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";

// ==============================|| SAMPLE PAGE ||============================== //

const CallDetails = () => {
  const [load, setLoad] = useState(false);
  const { call_id } = useParams();
  const statusInitials = {
    call_id: call_id,
    status: "",
    comment: "",
  };
  const statusFields = {
    device: {
      name: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "closed", label: "Close" },
        { value: "NeedBackup", label: "Need Backup" },
        { value: "MissInformation", label: "MissInformation Closed" },
      ],
    },
    comment: {
      name: "comment",
      type: "text",
      label: "Remarks",
    },
  };
  const validationSchema = Yup.object(
    Object.keys(statusFields).reduce((acc, field) => {
      acc[field] = statusFields[field].validation;
      return acc;
    }, {})
  );
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const response = await HomePageService.updateSOSCall(values);
      resetForm(statusInitials);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };
  const [htmlContent, setHtmlContent] = useState("");
  useEffect(() => {
    const retriveCallDetails = async () => {
      try {
        const retriveData = await HomePageService.getCallDetails(call_id);
        setHtmlContent(retriveData.data);
        setLoad(true);
      } catch (error) {
        console.log(error);
      }
    };
    retriveCallDetails();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleBroadcast = async () => {
    const data = {
      call_id: call_id,
    };
    try {
      const response = await HomePageService.broadCastHelp(data);
    } catch (error) {
      console.error("Error :", error.message);
    }
  };
  return (
    <MainCard>
      <Grid container spacing={gridSpacing}>
        <Grid item xs={6}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleBroadcast}
          >
            Broadcast
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Formik
            initialValues={statusInitials}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2} className="form-controller">
                  {Object.keys(statusFields).map((field) => (
                    <Grid key={field} item md={6} sm={12} xs={12}>
                      <FormField
                        fieldConfig={statusFields[field]}
                        formik={formik}
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
        </Grid>
      </Grid>
      <br />
      <iframe
        title="HTML Content"
        srcDoc={htmlContent} // Set the HTML content as srcDoc
        style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
      />
    </MainCard>
  );
};
export default CallDetails;
