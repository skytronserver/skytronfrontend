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
import { none } from "ol/centerconstraint";
import SearchIcon from '@mui/icons-material/Search'; // Import the search icon


const LiveTracking = () => {
  const [load, setLoad] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [imeiNo, setImeiNo] = useState("");
  const [typeFilter, setTypeFilter] = useState("default");
  const [tableDataTop, setTableDataTop] = useState([]); // Data for the scrollable table
  const [selectedId, setSelectedId] = useState(null); // Track the selected button ID
  const [filteredData, setFilteredData] = useState([]); // Data for the bottom table

  const keyMapping = {
    "entry_time": "Entry Time",
    "packet_type": "Packet Type",
    "alert_id": "Alert ID",
    "packet_status": "Packet Status",
    "gps_status": "GPS Status",
    "date": "Date",
    "time": "Time",
    "latitude": "Latitude",
    "latitude_dir": "Latitude Direction",
    "longitude": "Longitude",
    "longitude_dir": "Longitude Direction",
    "speed": "Speed (km/h)",
    "heading": "Heading",
    "satellites": "Satellites",
    "altitude": "Altitude (m)",
    "pdop": "PDOP",
    "hdop": "HDOP",
    "network_operator": "Network Operator",
    "ignition_status": "Ignition Status",
    "main_power_status": "Main Power Status",
    "main_input_voltage": "Main Input Voltage (V)",
    "internal_battery_voltage": "Internal Battery Voltage (V)",
    "emergency_status": "Emergency Status",
    "box_tamper_alert": "Box Tamper Alert",
    "gsm_signal_strength": "GSM Signal Strength",
    "mcc": "MCC",
    "mnc": "MNC",
    "lac": "LAC",
    "cell_id": "Cell ID",
    "nbr1_cell_id": "Neighbor 1 Cell ID",
    "nbr1_lac": "Neighbor 1 LAC",
    "nbr1_signal_strength": "Neighbor 1 Signal Strength",
    "nbr2_cell_id": "Neighbor 2 Cell ID",
    "nbr2_lac": "Neighbor 2 LAC",
    "nbr2_signal_strength": "Neighbor 2 Signal Strength",
    "nbr3_cell_id": "Neighbor 3 Cell ID",
    "nbr3_lac": "Neighbor 3 LAC",
    "nbr3_signal_strength": "Neighbor 3 Signal Strength",
    "nbr4_cell_id": "Neighbor 4 Cell ID",
    "nbr4_lac": "Neighbor 4 LAC",
    "nbr4_signal_strength": "Neighbor 4 Signal Strength",
    "digital_input_status": "Digital Input Status",
    "digital_output_status": "Digital Output Status",
    "frame_number": "Frame Number",
    "odometer": "Odometer (km)",
    "device_tag": "Device Tag",
    "vehicle_registration_number": "Vehicle Registration Number",
    "imei": "IMEI"
  };

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

  const iconData = [
    {
      iconUrl: "https://skytrack.tech:2000/static/track.png",
      text: "All",
      color: "black",
      key: "default",
    },
    {
      iconUrl: "https://skytrack.tech:2000/static/logo/red-skytron-transparent.png",
      text: "Em. Alert",
      color: "red",
      key: "red",
    },
    {
      iconUrl: "https://skytrack.tech:2000/static/logo/orange-skytron-transparent.png",
      text: "Alert",
      color: "orange",
      key: "orange",
    },
    {
      iconUrl: "https://skytrack.tech:2000/static/logo/blue-skytron-transparent.png",
      text: "Eng On",
      color: "blue",
      key: "blue",
    },
    {
      iconUrl: "https://skytrack.tech:2000/static/logo/green-skytron-transparent.png",
      text: "Moving",
      color: "green",
      key: "green",
    },
    {
      iconUrl: "https://skytrack.tech:2000/static/logo/grey-skytron-transparent.png",
      text: "Offline",
      color: "grey",
      key: "grey",
    },
  ];

  const iconStyles = {
    red: "https://skytrack.tech:2000/static/logo/red-skytron-transparent.png",

    orange: "https://skytrack.tech:2000/static/logo/orange-skytron-transparent.png",

    blue: "https://skytrack.tech:2000/static/logo/blue-skytron-transparent.png",

    green: "https://skytrack.tech:2000/static/logo/green-skytron-transparent.png",

    grey: "https://skytrack.tech:2000/static/logo/grey-skytron-transparent.png",

    default: "https://skytrack.tech:2000/static/track.png",

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
    } else if (String(data.ignition_status) === "1" && data.speed === 0) {
      return iconStyles.blue; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 0) {
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
    } else if (String(data.ignition_status) === "1" && data.speed === 0) {
      return "blue"; // Ignition ON but stationary - Blue Icon
    } else if (String(data.ignition_status) === "1" && data.speed > 0) {
      return "green"; // Ignition ON and moving - Green Icon
    } else if (timeDifference > 5) {
      return "grey"; // Offline device (no packets from device for 5+ minutes) - Grey Icon
    } else {
      return "default"; // Default icon for all other conditions
    }
  };

  const filterByType = (data) => {
    setTypeFilter(data);
    if (data === "default") { setFilteredData(tableDataTop); }
    else {
      const selectedRow = tableDataTop.find((row) => getAlartType(row) === data);
      setFilteredData(selectedRow ? [selectedRow] : tableDataTop);
    }

    setSelectedId(null);
  };

  const checkType = (type, data) => {

    if (type === "default" || getAlartType(data) === type) { return true }
    else { return false }
  };
  return (
    <MainCard>
      <Typography variant="h6">Live Tracking</Typography>

      {/* Scrollable Table (First Table) */}
      <div style={{ display: "flex", paddingTop: "20px" }}>
        <div
          style={{
            width: "20%",
            marginRight: "20px",
            height: selectedId ? "400px" : "600px",
            overflowY: "scroll", // Scrollable view
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <TableContainer component={Paper}>
            <Table>
              <TableBody>

                <TableRow  >
                  <TableCell colSpan={6}>

                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2} className="form-controller">
                        <Grid item md={8} sm={24} xs={24} style={{ marginTop: "20px" }}>
                          <TextField
                            fullWidth
                            label="Vehicle Registration No"
                            type="text"
                            value={vehicleNo}
                            name="vehicleNo"
                            onChange={handleInput}
                          />
                        </Grid>

                        {/*<Grid item md={3} sm={12} xs={12} style={{ marginTop: "20px" }}>
                          <TextField
                            fullWidth
                            label="IMEI Number"
                            type="text"
                            value={imeiNo}
                            name="imeiNo"
                            onChange={handleInput}
                          />
                        </Grid>*/}

                        <Grid item md={1} sm={6} xs={6} style={{ marginTop: "20px" }}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            style={{ height: "48px" }}
                          >
                            <SearchIcon /> {/* This will replace the "Search" text with the icon */}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>

                  </TableCell>
                </TableRow>
                <TableRow>
                  {iconData.map((item, index) => (
                    <TableCell onClick={() => filterByType(item.key)}
                      key={index}

                      color={typeFilter === item.key ? "#bfbfef" : "#eaf5ff"}
                      style={{
                        padding: "4px", // Reduce padding
                        textAlign: "center",
                        verticalAlign: "middle",
                        borderBottom: "solid",
                        backgroundColor: typeFilter === item.key ? "#bfbfef" : "#eaf5ff",
                        // Prevent text wrap
                        verticalAlign: "top",
                        width: "50px", // Adjust width as needed
                      }}
                    >
                      <img
                        src={item.iconUrl}
                        alt={item.text}
                        style={{ width: "15px", marginRight: "4px" }} // Smaller icon size
                      />
                      <Typography variant="caption" style={{ textAlign: "left", verticalAlign: "top", color: item.color, fontSize: "10px" }}>
                        {item.text}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>



                {tableDataTop.length > 0 ? (
                  tableDataTop.map((row) => checkType(typeFilter, row) && (
                    <TableRow key={row.id} style={{ borderBottom: "none" }}>

                      <TableCell colSpan={6}
                        onClick={() => handleButtonClick(row.id)}
                        color={selectedId === row.id ? "gray" : "#eaf5ff"} style={{
                          backgroundColor: selectedId === row.id ? "gray" : "#eaf5ff", paddingBottom: "5px", borderBottom: "none"
                        }}>
                        <img
                          src={getIconStyle(row)}
                          style={{ width: "15px", marginRight: "4px" }} // Smaller icon size
                        />
                        {row.vehicle_registration_number}

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
        <div style={{ width: "80%", height: "100%" }}>
          <MapComponent gpsData={filteredData} width="100%" height={selectedId ? "400px" : "600px"} />
        </div>
      </div>

      {selectedId && (
        <TableContainer component={Paper} style={{
          marginTop: "20px",
          maxHeight: "500px", // Set max height for vertical scrolling
          maxWidth: "100%",   // Set max width for horizontal scrolling
          overflowX: "auto",  // Enable horizontal scrolling
          overflowY: "auto",  // Enable vertical scrolling
        }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {/* Dynamically generate headers based on data keys */}
                {filteredData.length > 0 &&
                  Object.keys(filteredData[0]).map((key) => (
                    <TableCell key={key}> {keyMapping[key] || key} </TableCell>
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
      )}

    </MainCard>
  );
};

export default LiveTracking;
