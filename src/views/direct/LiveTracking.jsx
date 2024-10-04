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
  Box,
} from "@mui/material";
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import MapComponent from "./LiveMap";
import { none } from "ol/centerconstraint";
import SearchIcon from "@mui/icons-material/Search"; // Import the search icon
import { keyMapping, iconData, iconStyles,fullText,isoDatePattern } from "../../store/constant";
import {formatDateTime} from "../../helper"
import CircularProgress from '@mui/material/CircularProgress';
import "./tabstyle.css";
const LiveTracking = () => {
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");
  const [typeFilter, setTypeFilter] = useState("default");
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
      const retriveData_table = await HomePageService.getLiveTracking_data(
        data
      );
      if (Array.isArray(retriveData_table.data.data)) {
        setTableDataTop(retriveData_table.data.data);
        setFilteredData(retriveData_table.data.data);
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
    setSelectedId(null);
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

  // Helper to calculate time difference in minutes
  const calculateTimeDifference = (startTime, endTime) => {
    const timeDifferenceMillis = endTime - startTime;
    return timeDifferenceMillis / (1000 * 60); // Convert milliseconds to minutes
  };
  const getIconStyle = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);
    console.log("timediff", timeDifference);
    console.log("data.packet_type ", data.packet_type);
    console.log("data.ignition_status ", data.ignition_status);
    console.log("data.speed  ", data.speed);

    if (data.packet_type === "EA") {
      return iconStyles.red; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return iconStyles.orange; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
      return iconStyles.blue; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      return iconStyles.green; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return iconStyles.grey; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      return iconStyles.default; // Default icon for all other conditions
    }
  };

  const getAlartType = (data) => {
    const entryTime = new Date(data.entry_time);
    const currentTime = new Date();
    const timeDifference = calculateTimeDifference(entryTime, currentTime);

    if (data.packet_type === "EA") {
      return "red"; // EA Packet - Red Icon
    } else if (data.packet_type !== "NR") {
      return "orange"; // Any Alert Packet except EA - Orange Icon
    } else if (String(data.ignition_status) === "1" && data.speed <= 1) {
      return "blue"; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 1) {
      return "green"; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return "grey"; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      return "default"; // Default icon for all other conditions
    }
  };

  const filterByType = (data) => {
    setTypeFilter(data);
    if (data === "default") {
      setFilteredData(tableDataTop);
    } else {
      const selectedRow = tableDataTop.find(
        (row) => getAlartType(row) === data
      );
      setFilteredData(selectedRow ? [selectedRow] : tableDataTop);
    }

    setSelectedId(null);
  };

  const checkType = (type, data) => {
    if (type === "default" || getAlartType(data) === type) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <MainCard>
      <Typography variant="h4">Live Tracking</Typography>

      {/* Scrollable Table (First Table) */}
      <div className="container">
        <div
          className={
            selectedId
              ? "first-div first-div-small"
              : "first-div first-div-large"
          }
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} className="form-grid-container">
              <Grid item className="grid-item">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <TextField
                    fullWidth
                    label="Vehicle Registration No"
                    type="text"
                    value={vehicleNo}
                    name="vehicleNo"
                    onChange={handleInput}
                    variant="outlined"
                    InputProps={{ sx: { borderRadius: 0 } }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="submit-button"
                  >
                    <SearchIcon className="submit-button-icon" />
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
          <TableContainer component={Paper} className="table-container">
            <Table>
              {iconData && <TableHead>
                <TableRow>
                  {iconData.slice(0, 3).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                    >
                      <img src={item.iconUrl} alt={item.text} />
                      <Typography variant="caption" className="icon-text">
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  {iconData.slice(3, 6).map((item, index) => (
                    <TableCell
                      key={index}
                      onClick={() => filterByType(item.key)}
                      className="tracking-icon"
                    >
                      <img src={item.iconUrl} alt={item.text} />
                      <Typography variant="caption" className="icon-text">
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              }
              <TableBody>
                {tableDataTop.length > 0 ? (
                  tableDataTop.map(
                    (row) =>
                      checkType(typeFilter, row) && (
                        <TableRow key={row.id} className="table-row">
                          <TableCell
                            colSpan={6}
                            onClick={() => handleButtonClick(row.id)}
                            className={`table-cell ${
                              selectedId === row.id ? "table-cell-selected" : ""
                            }`}
                          >
                            <img src={getIconStyle(row)} />
                            <span>{row.vehicle_registration_number}</span>
                          </TableCell>
                        </TableRow>
                      )
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} style={{textAlign:'center'}}><CircularProgress size="30px" /></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        {/* HTML Content (iframe) */}
        <div style={{ width: "80%", height: "100%" }}>
          <MapComponent
            gpsData={filteredData}
            width="100%"
            height={selectedId ? "400px" : "600px"}
          />
        </div>
      </div>

      {selectedId && (
        <TableContainer component={Paper} className="skytron-table-container">
          
          <Table className="skytron-table">
      <TableHead>
        <TableRow>
          {/* Dynamically generate headers based on keyMapping order */}
          {filteredData.length > 0 &&
            Object.keys(keyMapping).map((key) => (
              <TableCell key={key} className="skytron-table-header-cell">
                {keyMapping[key]}
              </TableCell>
            ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredData.length > 0 ? (
          filteredData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="skytron-table-row">
              {/* Dynamically generate table cells based on keyMapping order */}
              {Object.keys(keyMapping).map((key, cellIndex) => (
                <TableCell key={cellIndex} className="skytron-table-cell">
                  {fullText?.[row[key]] || (isoDatePattern.test(row[key]) && formatDateTime(row[key])) || row[key] || ""}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={Object.keys(keyMapping).length}
              className="skytron-no-data-cell"
            >
              No data available
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
        </TableContainer>
      )}
    </MainCard>
  );
};

export default LiveTracking;
