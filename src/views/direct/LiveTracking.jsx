import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import MapComponent from "./LiveMap";

const LiveTracking = () => {
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");
  const [tableDataTop, setTableDataTop] = useState([]); // Data for the scrollable table
  const [selectedId, setSelectedId] = useState(null); // Track the selected button ID
  const [filteredData, setFilteredData] = useState([]); // Data for the bottom table

  // Handle input changes
  const handleInput = (event) => {
    const { name, value } = event.target;
    if (name === "vehicleNo") {
      setVehicleNo(value);
    } else if (name === "imeiNo") {
      setImeiNo(value);
    }
  };

  const retriveMapData = async (data) => {
    try {
      const retriveData_table = await HomePageService.getLiveTracking_data(data);
      if (Array.isArray(retriveData_table.data.data)) {
        setTableDataTop(retriveData_table.data.data);
        setFilteredData(retriveData_table.data.data); // Load all data to the bottom table initially
      }
      setLoad(true);
    } catch (error) {
      console.log(error);
    }
  };

  // Triggered on form submit to fetch new data
  const handleSubmit = (event) => {
    event.preventDefault();
    const params = {
      imei: imeiNo,
      regno: vehicleNo,
    };
    retriveMapData(params);
  };

  useEffect(() => {
    // Automatically load the data when the page initially loads
    retriveMapData({});
  }, []);

  // Handle button click, update selectedId and filtered data
  const handleButtonClick = (id) => {
    setSelectedId(id); // Update selected ID
    const selectedRow = tableDataTop.find((row) => row.id === id);
    setFilteredData(selectedRow ? [selectedRow] : tableDataTop); // Show only selected row's data or all if none selected
  };

  return (
    <MainCard>
      <Typography variant="h6">Live Tracking</Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="Vehicle Registration No"
              type="text"
              value={vehicleNo}
              name="vehicleNo"
              onChange={handleInput}
            />
          </Grid>
          <Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <TextField
              fullWidth
              label="IMEI Number"
              type="text"
              value={imeiNo}
              name="imeiNo"
              onChange={handleInput}
            />
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
            >
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>

      {/* Scrollable Table (First Table) */}
      <div style={{ display: "flex", paddingTop: "20px" }}>
        <div
          style={{
            width: "20%",
            marginRight: "20px",
            height: "400px",
            overflowY: "scroll", // Scrollable view
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableBody>
                {tableDataTop.length > 0 ? (
                  tableDataTop.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Button
                          variant="contained"
                          color={selectedId === row.id ? "secondary" : "primary"} // Change color if selected
                          onClick={() => handleButtonClick(row.id)}
                        >
                          {row.vehicle_registration_number}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell>No data available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* HTML Content (iframe) */}
        <div style={{ width: "80%", height: "400px" }}>

          <MapComponent gpsData={filteredData} width="100%" height="400px" />
          { //< iframe
            //title="HTML Content"
            // srcDoc={htmlContent} // Set the HTML content as srcDoc
            // style={{ width: "100%", height: "400px", border: "1px solid #ccc" }}
            ///>
          }
        </div>
      </div>

      {/* Bottom Data Table (Filtered by selected button) */}
      <TableContainer component={Paper} style={{ marginTop: "20px" }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* Dynamically generate headers based on data keys */}
              {filteredData.length > 0 &&
                Object.keys(filteredData[0]).map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, idx) => (
                    <TableCell key={idx}>{value}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell>No data available</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
};

export default LiveTracking;
