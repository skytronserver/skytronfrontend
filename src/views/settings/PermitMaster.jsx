import { Button, CircularProgress, Grid } from "@mui/material";
import { Formik } from "formik";
import React, { useState, useEffect } from "react";
import { gridSpacing } from "../../store/constant";
import SettingService from "../../services/SettingService";
import * as Yup from "yup";
import FormField from "../../ui-component/CustomTextField";
import MainCard from "../../ui-component/cards/MainCard";
import DialogComponent from "../../ui-component/DialogComponent";
import { convertErrorObjectToArray } from "../../helper";

//Datatables
import { useSelector, useDispatch } from 'react-redux';
import { fetchPermitMasterList } from '../../actions/settingAction';
import DynamicDatatables from '../../datatables/DynamicDatatables';
import { getPermitMasterColumns } from '../../datatables/settingColumns';

function PermitMaster({ fieldConfig, initialData }) {
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [alert, setAlert] = useState({
    error: false,
    message: "",
    errorList: [],
  });
  const [loading, setLoading] = useState(false);
  
  // State to handle edit mode
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(initialData);

  //Datatables data using redux
  const dispatch = useDispatch();
  const permitMasterList = useSelector((state) => state.setting.permitMasterList || []);

  const retrivePermitMasterList = async () => {
    try {
      const response = await SettingService.list_all_settings_permit_master({});
      dispatch(fetchPermitMasterList(response.data));
      setLoad(true);
    } catch (error) {
      console.error("Failed to fetch permit master list", error);
    }
  };

  useEffect(() => {
    retrivePermitMasterList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleAlert = (message, isError = false) => {
    setAlert((prevAlert) => ({ ...prevAlert, message: message, error: isError }));
    setOpen(true);
  };

  const validationSchema = Yup.object(
    Object.keys(fieldConfig).reduce((acc, field) => {
      acc[field] = fieldConfig[field].validation;
      return acc;
    }, {})
  );

  const handleEdit = (rowData) => {
    setEditMode(true);
    setFormData(rowData);
  };

  const handleToggleStatus = async (rowData) => {
    setLoading(true);
    try {
      await SettingService.edit_settings_permit_master({
        id: rowData.id,
        is_active: !rowData.is_active
      });
      handleAlert("Status toggled successfully");
      retrivePermitMasterList();
    } catch (error) {
      console.error("Error in API Service:", error);
      handleAlert("Failed to toggle status", true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setLoading(true);
    try {
      if (editMode && values.id) {
        await SettingService.edit_settings_permit_master(values);
      } else {
        await SettingService.create_settings_permit_master(values);
      }
      
      setAlert((prevAlert) => ({ ...prevAlert, error: false, errorList: [] }));
      handleAlert(editMode ? "Permit Master Updated Successfully" : "Permit Master Added Successfully");
      
      setEditMode(false);
      setFormData(initialData);
      resetForm({ values: initialData });
      retrivePermitMasterList();
    } catch (error) {
      console.error("Error in API Service:", error);
      const errors = error.response?.data || {};
      setAlert((prevAlert) => ({
        ...prevAlert,
        error: true,
        errorList: convertErrorObjectToArray(errors),
      }));
      handleAlert("Form Submission Failed", true);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleCancelEdit = (resetForm) => {
    setEditMode(false);
    setFormData(initialData);
    resetForm({ values: initialData });
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
          <div
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              background: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <CircularProgress
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
              size={50}
            />
          </div>
        )}
        <Grid
          item
          xs={12}
          style={{
            opacity: loading ? 0.5 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        >
          <MainCard title={editMode ? "Edit Permit Master" : "Add New Permit Master"}>
            <Formik
              initialValues={formData}
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
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12} style={{ marginTop: "20px", display: 'flex', gap: '10px' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {editMode ? "Update" : "Add"}
                      </Button>
                      {editMode && (
                        <Button
                          type="button"
                          variant="outlined"
                          color="secondary"
                          onClick={() => handleCancelEdit(formik.resetForm)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </MainCard>
        </Grid>
      </Grid>
      <br />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12} style={{
          opacity: loading ? 0.5 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}>
          <MainCard title="Permit Master List">
            {load && <DynamicDatatables 
               tableTitle="Permit Master List" 
               rows={permitMasterList} 
               columns={getPermitMasterColumns(handleEdit, handleToggleStatus)}
            />}
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
}

export default PermitMaster;
