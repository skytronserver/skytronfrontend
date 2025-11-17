import React from 'react';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
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
  }, [deviceStatus]);

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

