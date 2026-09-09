import React, { useState } from 'react';
import { Grid, Button, CircularProgress, TextField, Card, CardContent, Typography, Box } from "@mui/material";
import MainCard from "../../../ui-component/cards/MainCard";
import { gridSpacing } from "../../../store/constant";
import DynamicDatatables from "../../../datatables/DynamicDatatables";
import DialogComponent from "../../../ui-component/DialogComponent";
import axios from 'axios';

const M2mEsimQuery = () => {
  const [loading, setLoading] = useState(false);
  const [k1, setK1] = useState("CUuj4vqr9hdZ0JdTVvQBRx05Gegs0Zcsx3NcOH6xnTjxEsxXAwG1WkEAkP3dihip");
  const [k2, setK2] = useState("89911025034089231833");
  const [scanResult, setScanResult] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleQuery = async () => {
    if (!k1 || !k2) {
      setAlertMessage("Please enter K1 and K2.");
      setAlertOpen(true);
      return;
    }

    setLoading(true);
    setScanResult(null);

    try {
      const response = await axios.post('https://api-tracking.mapwala.in/api/pub/esim/query/', {
        k1: k1,
        k2: k2
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data && response.data.apiResponseCode === "LCM_001") {
        setScanResult(response.data);
      } else {
        setAlertMessage(response.data.apiResponseMsg || "Failed to fetch query results.");
        setAlertOpen(true);
      }
    } catch (error) {
      console.error("eSIM Query error:", error);
      const errorMsg = error?.response?.data?.apiResponseMsg || "Failed to fetch query results.";
      setAlertMessage(errorMsg);
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { name: "iccid", label: "ICCID" },
    { name: "cardState", label: "Card State" },
    { name: "cardStatus", label: "Card Status" },
    { name: "activateOn", label: "Activate On" },
    { name: "expiredOn", label: "Expired On" },
    { name: "primaryTSP", label: "Primary TSP" },
    { name: "primaryMSISDN", label: "Primary MSISDN" },
    { name: "primaryStatus", label: "Primary Status" },
    { name: "fallbackTSP", label: "Fallback TSP" },
    { name: "fallbackMSISDN", label: "Fallback MSISDN" },
    { name: "dataUsage", label: "Data Usage" },
    { name: "dataUsageDate", label: "Data Usage Date" }
  ];

  return (
    <>
      <DialogComponent
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertMessage}
        errorList={[]}
      />

      <Grid container spacing={gridSpacing}>
        {loading && (
          <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999, background: "rgba(255, 255, 255, 0.5)" }}>
            <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} size={50} />
          </div>
        )}

        <Grid item xs={12}>
          <MainCard title="eSIM Query">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="K1 (API Key)"
                  value={k1}
                  onChange={(e) => setK1(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={5}>
                <TextField
                  fullWidth
                  label="K2 (ICCID)"
                  value={k2}
                  onChange={(e) => setK2(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button variant="contained" color="primary" onClick={handleQuery} fullWidth disabled={loading}>
                  Query
                </Button>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {scanResult && scanResult.resultObj && (
          <Grid item xs={12}>
            <DynamicDatatables tableTitle="Query Results" rows={scanResult.resultObj} columns={columns} />
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default M2mEsimQuery;
