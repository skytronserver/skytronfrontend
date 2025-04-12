import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formFields, initialValues } from "../../formjson/schoolHolidays";
import "./form.css";

// Dummy data for holidays
const dummyHolidays = [
  {
    id: 1,
    holidayName: "Summer Vacation",
    startDate: "2023-05-15",
    endDate: "2023-06-30",
    description: "Annual summer break for all students",
    holidayType: "school",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 2,
    holidayName: "Diwali",
    startDate: "2023-11-12",
    endDate: "2023-11-14",
    description: "Festival of lights holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 3,
    holidayName: "Christmas",
    startDate: "2023-12-25",
    endDate: "2023-12-26",
    description: "Christmas holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 4,
    holidayName: "Mid-Term Exams",
    startDate: "2023-09-15",
    endDate: "2023-09-20",
    description: "Mid-term examination period",
    holidayType: "exam",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 5,
    holidayName: "Republic Day",
    startDate: "2023-01-26",
    endDate: "2023-01-26",
    description: "National holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 6,
    holidayName: "Winter Break",
    startDate: "2023-12-20",
    endDate: "2023-12-31",
    description: "Winter vacation for all students",
    holidayType: "school",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 7,
    holidayName: "Independence Day",
    startDate: "2023-08-15",
    endDate: "2023-08-15",
    description: "National holiday",
    holidayType: "public",
    status: "Active",
    createdBy: "admin"
  },
  {
    id: 8,
    holidayName: "Final Exams",
    startDate: "2023-03-10",
    endDate: "2023-03-20",
    description: "Final examination period",
    holidayType: "exam",
    status: "Active",
    createdBy: "admin"
  }
];

const SchoolHolidayForm = () => {
  const params = useParams();
  const parameter = params['*'] && !isNaN(params['*']);
  const [editPage, setEditPage] = useState(false);
  const [open, setOpen] = useState(false);
  const [holidayInitialValues, setHolidayInitialValues] = useState(initialValues);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (params['*'] && !isNaN(params['*'])) {
      const id = params['*'];
      (async () => {
        try {
          // Using dummy data instead of API call
          const holiday = dummyHolidays.find(h => h.id === parseInt(id));
          if (holiday) {
            setHolidayInitialValues({
              holidayName: holiday.holidayName,
              startDate: holiday.startDate,
              endDate: holiday.endDate,
              description: holiday.description,
              status: holiday.status,
              holidayType: holiday.holidayType,
              id: holiday.id
            });
            setEditPage(true);
          }
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      setHolidayInitialValues(initialValues);
      setEditPage(false);
    }
  }, [parameter]);

  const handleClose = () => {
    !alert.error && navigate("/holiday/all-holiday-list");
    setOpen(false);
  };

  const handleAlert = (message) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message }));
    setOpen(true);
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
        createdBy: userId,
      };
      setSubmitting(true);
      setLoading(true);
      let message = "Holiday added successfully";

      if (editPage) {
        message = "Holiday updated successfully";
        // Simulating API call with dummy data
        console.log("Updating holiday:", valuesWithRole);
      } else {
        // Simulating API call with dummy data
        console.log("Creating holiday:", valuesWithRole);
      }

      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(message);
      resetForm(holidayInitialValues);
    } catch (error) {
      console.error("Error managing holiday:", error?.message);
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
          <MainCard title={editPage ? "Edit Holiday" : "New Holiday"}>
            <Formik
              initialValues={holidayInitialValues}
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

export default SchoolHolidayForm; 