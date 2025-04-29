import { Grid, Button, CircularProgress } from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import { gridSpacing } from "../../store/constant";
import { Formik } from "formik";
import FormField from "../../ui-component/CustomTextField";
import * as Yup from "yup";
import DialogComponent from "../../ui-component/DialogComponent";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFormFields } from "../../formjson/schoolHolidays";
import HolidayService from "../../services/HolidayService";
import { useTranslation } from 'react-i18next';
import "./form.css";

// Initial form values matching API field names
const defaultInitialValues = {
  holidayName: "",
  startDate: "",
  endDate: "",
  description: "",
  status: "Active",
  holidayType: "",
  vehicles: []
};

const SchoolHolidayForm = () => {
  const { t } = useTranslation();
  const params = useParams();
  const holidayId = params['*'];
  const [editMode, setEditMode] = useState(false);
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState(defaultInitialValues);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get form fields with translations
  const formFields = getFormFields(t);

  // Fetch holiday data if in edit mode
  useEffect(() => {
    const fetchHolidayData = async () => {
      if (holidayId && !isNaN(holidayId)) {
        setLoading(true);
        try {
          const response = await HolidayService.getAllHolidays();
          // Check if response has the expected structure
          if (!response?.data?.data) {
            throw new Error('Invalid response format from server');
          }

          const holiday = response.data.data.find(h => h.id === parseInt(holidayId));
          if (holiday) {
            // Transform snake_case to camelCase
            setFormValues({
              holidayName: holiday.holiday_name || "",
              startDate: holiday.start_date || "",
              endDate: holiday.end_date || "",
              description: holiday.description || "",
              status: holiday.status || "Active",
              holidayType: holiday.holiday_type || "",
              vehicles: holiday.vehicles || []
            });
            setEditMode(true);
          } else {
            handleAlert(t('holiday.form.notFound'), true);
            navigate("/holiday/all-holiday-list");
          }
        } catch (error) {
          console.error('Error fetching holiday:', error);
          handleAlert(error?.response?.data?.message || t('holiday.fetchError'), true);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchHolidayData();
  }, [holidayId, navigate, t]);

  const handleClose = () => {
    if (!alert.error) {
      navigate("/holiday/all-holiday-list");
    }
    setOpen(false);
  };

  const handleAlert = (message, isError = false) => {
    setAlert((prevAlert) => ({ 
      ...prevAlert, 
      message: message,
      error: isError 
    }));
    setOpen(true);
  };

  // Form validation schema with API field names
  const validationSchema = Yup.object().shape({
    holidayName: Yup.string().required(t('holiday.form.validation.nameRequired')),
    startDate: Yup.date().required(t('holiday.form.validation.startDateRequired')),
    endDate: Yup.date()
      .required(t('holiday.form.validation.endDateRequired'))
      .min(
        Yup.ref('startDate'),
        t('holiday.form.validation.endDateAfterStart')
      ),
    description: Yup.string().required(t('holiday.form.validation.descriptionRequired')),
    status: Yup.string().required(t('holiday.form.validation.statusRequired')),
    holidayType: Yup.string().required(t('holiday.form.validation.typeRequired')),
    vehicles: Yup.array().of(Yup.number())
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    try {
      const formData = {
        holidayName: values.holidayName,
        startDate: values.startDate,
        endDate: values.endDate,
        description: values.description,
        status: values.status,
        holidayType: values.holidayType,
        vehicles: values.vehicles,
        created_by_id: 242 // This should come from your auth context or user session
      };

      if (editMode) {
        await HolidayService.updateHoliday(holidayId, formData);
        handleAlert(t('holiday.form.updateSuccess'));
      } else {
        await HolidayService.createHoliday(formData);
        handleAlert(t('holiday.form.createSuccess'));
        resetForm();
      }
      navigate("/holiday/all-holiday-list");
    } catch (error) {
      console.error("Error managing holiday:", error);
      handleAlert(
        error?.response?.data?.message || t('holiday.form.error'),
        true
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Updated form fields configuration to match API field names
  const updatedFormFields = {
    holidayName: {
      ...formFields.holidayName,
      name: 'holidayName'
    },
    startDate: {
      ...formFields.startDate,
      name: 'startDate'
    },
    endDate: {
      ...formFields.endDate,
      name: 'endDate'
    },
    description: {
      ...formFields.description,
      name: 'description'
    },
    status: {
      ...formFields.status,
      name: 'status'
    },
    holidayType: {
      ...formFields.holidayType,
      name: 'holidayType'
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
          <MainCard title={editMode ? t('holiday.form.editTitle') : t('holiday.form.title')}>
            <Formik
              initialValues={formValues}
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
                        disabled={loading || formik.isSubmitting}
                      >
                        {loading ? t('common.loading') : t('common.submit')}
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