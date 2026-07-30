import React from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import { gridSpacing } from "../../../store/constant";
import StockServices from '../../../services/StockServices';
import SettingService from '../../../services/SettingService';
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
  console.log(deviceStatus,"deviceStatus");
  const [reload, setReload] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("")

  const title = {
    valid: t('simActivation.titles.valid'),
    invalid: t('simActivation.titles.invalid'),
    pending: t('simActivation.titles.pending')
  };

  const [rawList, setRawList] = useState([]);
  const [list, setList] = useState([]);
  const [whitelistedPhoneNumbers, setWhitelistedPhoneNumbers] = useState({ scn2: "", escn: "" });
  const [whitelistedIps, setWhitelistedIps] = useState({ eip: "", pip: "" });

  const [ipWhitelistDialogOpen, setIpWhitelistDialogOpen] = useState(false);
  const [ipWhitelistConfirmed, setIpWhitelistConfirmed] = useState(false);
  const [pendingRowData, setPendingRowData] = useState(null);

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
        setRawList(retriveData.data || []);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceStatus, reload]);

  useEffect(() => {
    const fetchOtaFilter = async () => {
      try {
        const response = await SettingService.filter_settings_ota({
          page: 1,
          page_size: 10,
        });

        const otaData = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
          ? response.data
          : [];

        const phoneNumbers = { scn2: "", escn: "" };
        const ipAddresses = { eip: "", pip: "" };

        otaData.forEach((item) => {
          const command = item?.command || "";
          const [prefix, value] = command.split("-");

          if (!value) {
            return;
          }

          switch ((prefix || "").toUpperCase()) {
            case "SCN2":
              phoneNumbers.scn2 = value;
              break;
            case "ESCN":
              phoneNumbers.escn = value;
              break;
            case "EIP":
              ipAddresses.eip = value;
              break;
            case "PIP":
              ipAddresses.pip = value;
              break;
            default:
              break;
          }
        });

        setWhitelistedPhoneNumbers(phoneNumbers);
        setWhitelistedIps(ipAddresses);
      } catch (error) {
        console.error('Failed to fetch OTA filter data', error);
      }
    };

    fetchOtaFilter();
  }, []);

  useEffect(() => {
    if (!rawList || rawList.length === 0) {
      setList([]);
      return;
    }

    const mergedList = rawList.map((item) => ({
      ...item,
      whitelisted_phone_numbers: {
        scn2: whitelistedPhoneNumbers.scn2 || item?.whitelisted_phone_numbers?.scn2 || "",
        escn: whitelistedPhoneNumbers.escn || item?.whitelisted_phone_numbers?.escn || "",
      },
      whitelisted_ips: {
        eip: whitelistedIps.eip || item?.whitelisted_ips?.eip || "",
        pip: whitelistedIps.pip || item?.whitelisted_ips?.pip || "",
      },
    }));

    setList(mergedList);
  }, [rawList, whitelistedPhoneNumbers, whitelistedIps]);

  const submitRequestUpdate = async (data, status) => {
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
  };

  const handleRequest = async (e, data, status) => {
    e.preventDefault();

    if (status === "accept") {
      setPendingRowData(data);
      setIpWhitelistConfirmed(false);
      setIpWhitelistDialogOpen(true);
      return;
    }

    const confirmed = window.confirm(t('simActivation.messages.confirmRequest'));
    if (!confirmed) return;

    await submitRequestUpdate(data, status);
  };

  const handleCloseIpWhitelistDialog = () => {
    setIpWhitelistDialogOpen(false);
    setPendingRowData(null);
    setIpWhitelistConfirmed(false);
  };

  const handleConfirmIpWhitelistAndSubmit = async () => {
    if (!pendingRowData || !ipWhitelistConfirmed) return;
    setIpWhitelistDialogOpen(false);
    await submitRequestUpdate(pendingRowData, "accept");
    setPendingRowData(null);
    setIpWhitelistConfirmed(false);
  };

  const actionColumn = [
    {
      name: "Action",
      label: t('simActivation.actions.action'),
      options: {
        filter: false,
        customBodyRender: (value, tableMeta) => {
          // Note: tableMeta.rowData contains raw values from API (timestamps, where present, are in GMT/UTC).
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
      <Dialog
        open={ipWhitelistDialogOpen}
        onClose={handleCloseIpWhitelistDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm IP Whitelisting</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Before approving this eSIM activation request, confirm that our server IP is whitelisted by the concerned M2M/telecom service provider.
          </Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Configured IPs
          </Typography>
          <Typography variant="body2">
            Emergency/Fallback Server IP: {whitelistedIps?.eip || "-"}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Primary Server IP: {whitelistedIps?.pip || "-"}
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={ipWhitelistConfirmed}
                onChange={(e) => setIpWhitelistConfirmed(e.target.checked)}
              />
            }
            label="Yes, our server IP is whitelisted by this provider"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseIpWhitelistDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmIpWhitelistAndSubmit}
            variant="contained"
            color="success"
            disabled={!ipWhitelistConfirmed}
          >
            Approve & Submit
          </Button>
        </DialogActions>
      </Dialog>
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

