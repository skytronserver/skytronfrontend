import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import { Grid, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next'; // Add this import
import MainCard from '../../ui-component/cards/MainCard';
import { gridSpacing } from '../../store/constant';
import FormField from '../../ui-component/CustomTextField';
import * as Yup from 'yup';
import DialogComponent from '../../ui-component/DialogComponent';
import StockServices from '../../services/StockServices';
import { accessoryInitials, accessoryFormField } from '../../formjson/accessoryForm';
import { filterModelList } from '../../helper';

const currentDate = new Date();
const formattedCurrentDate = currentDate.toISOString().split('T')[0];

const AccessoryForm = ({ formTitle }) => {
  const { t } = useTranslation(); // Initialize the hook
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [updatedFormFields, setUpdatedFormField] = useState(accessoryFormField);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: '',
    errorList: []
  });

  useEffect(() => {
    (async () => {
      const models = await filterModelList({ status: 'StateAdminApproved' });
      if (!models?.status) {
        setUpdatedFormField(prevConfig => ({
          ...prevConfig,
          model: {
            ...prevConfig.model,
            options: models,
          }
        }));
      }
      setIsFormLoaded(true);
    })();
  }, []);

  const handleClose = () => {
    setOpen(false);
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
      created: formattedCurrentDate,
      createdby: '31'
    };

    try {
      await StockServices.createAccessoryStock(valuesWithRole);
      resetForm(accessoryInitials);
      navigate('/accessory/show-accessory');
    } catch (error) {
      if (error?.response) {
        const errorObject = error?.response?.data || '';
        const errorString = errorObject !== '' ? Object.values(errorObject).flat().join("<br>") : '';
        setAlert({
          error: true,
          message: t('form.accessory.submitError'), // Use translation key
          errorList: errorString
        });
        setOpen(true);
      }
      console.error("Error :", error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
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
          <div style={{ 
            top: 0, 
            left: 0, 
            width: "100%", 
            height: "100%", 
            zIndex: 9999, 
            background: "rgba(255, 255, 255, 0.8)" 
          }}>
            <CircularProgress 
              style={{ 
                position: "absolute", 
                top: "50%", 
                left: "50%", 
                transform: "translate(-50%, -50%)" 
              }} 
              size={50} 
            />
          </div>
        )}
        <Grid item xs={12} style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.3s ease-in-out"}}>
          <MainCard title={t('form.accessory.title')}> {/* Use translation key */}
            {isFormLoaded && (
              <Formik
                initialValues={accessoryInitials}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} className="form-controller">
                      {Object.keys(updatedFormFields).map((field) => (
                        <Grid key={field} item md={4} sm={12} xs={12}>
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
                          {t('common.submit')} {/* Use translation key */}
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

export default AccessoryForm;