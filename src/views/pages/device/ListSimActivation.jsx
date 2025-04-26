import React from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { gridSpacing } from "../../../store/constant";
import StockServices from '../../../services/StockServices';
import { useEffect, useState } from 'react';
import DynamicDatatables from '../../../datatables/DynamicDatatables';
import { requestList } from '../../../datatables/deviceColumns';
import { useParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import AutoHideAlert from '../../../ui-component/AutoHideAlert';

const ListSimActivation = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const { deviceStatus } = useParams();
  const [reload, setReload] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");

  const title = {
    valid: t('simActivation.titles.valid'),
    invalid: t('simActivation.titles.invalid'),
    pending: t('simActivation.titles.pending')
  };

  const [list, setList] = useState([]);

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  useEffect(() => {
    const retrieveList = async () => {
      try {
        const status = {
          filters: {
            status: deviceStatus
          }
        };
        const retriveData = await StockServices.getListActivationRequest(status);
        setList(retriveData.data);
        setPageTitle(title?.[deviceStatus]);
        setLoad(true);
      } catch (error) {
        console.error(error);
        setAlertType("error");
        setAlertMessage(t('simActivation.messages.error'));
        setOpenAlert(true);
      }
    };
    retrieveList();
  }, [deviceStatus, reload, title]);

  const handleRequest = async (e, data, status) => {
    e.preventDefault();
    const confirmed = window.confirm(t('simActivation.messages.confirmRequest'));
    
    if (confirmed) {
      const formData = {
        eSim_activation_req_id: data[1],
        status: status,
      };
      try {
        await StockServices.updateRequest(formData);
        setReload(prev => !prev);
        setAlertType("success");
        setAlertMessage(t('simActivation.messages.success'));
        setOpenAlert(true);
      } catch (error) {
        console.error(error);
        setAlertType("error");
        setAlertMessage(t('simActivation.messages.error'));
        setOpenAlert(true);
      }
    }
  };

  const actionColumn = [
    {
      name: "Action",
      label: t('simActivation.actions.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          return (
            <div className="cellAction" style={{ display: "flex" }}>
              <div style={{ marginRight: "5px" }}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={(event) =>
                    handleRequest(event, tableMeta.rowData, "accept")
                  }
                >
                  {t('simActivation.actions.accept')}
                </Button>
              </div>
              <div style={{ marginRight: "5px" }}>
                <Button
                  type="submit"
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={(event) =>
                    handleRequest(event, tableMeta.rowData, "reject")
                  }
                >
                  {t('simActivation.actions.reject')}
                </Button>
              </div>
            </div>
          );
        },
      },
    },
  ];

  return (
    <>
      <AutoHideAlert
        open={openAlert}
        onClose={handleCloseAlert}
        message={alertMessage}
        type={alertType}
      />
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          {load && (
            <DynamicDatatables
              tableTitle={pageTitle}
              rows={list}
              columns={deviceStatus === 'pending' ? actionColumn.concat(requestList) : requestList}
            />
          )}
        </Grid>
      </Grid>
    </>
  );
};

export default ListSimActivation;

