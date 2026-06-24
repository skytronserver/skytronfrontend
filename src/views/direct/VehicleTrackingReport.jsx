import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import {
  TableHead,
  TablePagination,
} from "@mui/material";
import Button from "@mui/material/Button";
import DownloadIcon from "@mui/icons-material/Download";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import HomePageService from "../../services/HomePage";
import Collapse from "@mui/material/Collapse";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
const TOKEN =
  "YOUR_BEARER_TOKEN";

const STATUS_FILTERS = [
  "All",
  "Online",
  "Offline",
  "Moving",
  "Alert",
];

export default function VehicleTrackingReport() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [owner, setOwner] = useState("");
  const [category, setCategory] = useState("");
  const [speedLimit, setSpeedLimit] = useState("");
  const [poiOptions, setPoiOptions] = useState([]);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [poiLoading, setPoiLoading] = useState(false);

  const [poiTypes, setPoiTypes] = useState([]);
  const [selectedPoiType, setSelectedPoiType] = useState(null);
  const [poiTypeLoading, setPoiTypeLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedPoiId, setSelectedPoiId] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    const fetchPoiTypes = async () => {
      try {
        setPoiTypeLoading(true);

        const response =
          await HomePageService.getPoiTypes();

        setPoiTypes(response?.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setPoiTypeLoading(false);
      }
    };

    fetchPoiTypes();
  }, []);
  const fetchPois = async (searchText = "") => {
    try {
      setPoiLoading(true);

      const response =
        await HomePageService.getPoiList({
          name: searchText,
          use_type: selectedPoiType || "",
        });

      setPoiOptions(response?.data?.data || []);
    } catch {
      setPoiOptions([]);
    } finally {
      setPoiLoading(false);
    }
  };

  const handlePoiTypeChange = async (
    event,
    value
  ) => {
    setSelectedPoiType(value);

    setSelectedPoi(null);
    setSelectedPoiId("");
    setPoiOptions([]);

    if (!value) return;

    try {
      setPoiLoading(true);

      const response =
        await HomePageService.getPoiList({
          use_type: value,
        });

      setPoiOptions(response?.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPoiLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response =
        await HomePageService.getLiveTracking_data({
          owner,
          poi: selectedPoiId,
          roads: "",
          category,
          speed_limit: speedLimit,
          in_range: false,
          poi_t: selectedPoiType || "",
          start_datetime: startDateTime,
          end_datetime: endDateTime,
        });

      const vehicles = response?.data?.data || [];

      setVehicles(vehicles);
      setNoData(vehicles.length === 0);
      setSelectedVehicle((prev) => {
        if (!prev) return vehicles[0];

        return (
          vehicles.find((v) => v.imei === prev.imei) || prev
        );
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();


  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [
    owner,
    category,
    selectedPoiId,
    selectedPoiType,
    speedLimit,
    startDateTime,
    endDateTime,
  ]);

  const statusCounts = {
    All: vehicles.length,

    Online: vehicles.filter(
      (v) => v.gps_status === "1"
    ).length,

    Offline: vehicles.filter(
      (v) => v.gps_status !== "1"
    ).length,

    Moving: vehicles.filter(
      (v) => Number(v.speed) > 0
    ).length,

    Alert: vehicles.filter(
      (v) => v.emergency_status === "1"
    ).length,
  };


  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const regNo =
        vehicle.vehicle_registration_number?.toLowerCase() || "";

      const matchesSearch =
        regNo.includes(search.toLowerCase());

      if (!matchesSearch) return false;

      switch (statusFilter) {
        case "Online":
          return vehicle.gps_status === "1";

        case "Offline":
          return vehicle.gps_status !== "1";

        case "Moving":
          return Number(vehicle.speed) > 0;

        case "Alert":
          return vehicle.emergency_status === "1";

        default:
          return true;
      }
    });
  }, [vehicles, search, statusFilter]);
  useEffect(() => {
    if (
      filteredVehicles.length &&
      !filteredVehicles.some(
        (v) => v.imei === selectedVehicle?.imei
      )
    ) {
      setSelectedVehicle(filteredVehicles[0]);
    }
  }, [filteredVehicles, selectedVehicle]);

  const handleExport = () => {
    if (!filteredVehicles.length) {
      alert("No data available to export");
      return;
    }

    const exportData = filteredVehicles.map((vehicle) => ({
      "Vehicle No": vehicle.vehicle_registration_number || "",
      IMEI: vehicle.imei || "",
      Owner:
        vehicle?.device_tag_info?.vehicle_owner?.users?.[0]?.name || "",
      Category:
        vehicle?.device_tag_info?.category_info?.category || "",
      Make:
        vehicle?.device_tag_info?.vehicle_make || "",
      Speed: vehicle.speed || "",
      "GPS Status":
        vehicle.gps_status === "1" ? "Online" : "Offline",
      Ignition:
        vehicle.ignition_status === "1" ? "ON" : "OFF",
      Latitude: vehicle.latitude || "",
      Longitude: vehicle.longitude || "",
      Date: vehicle.date || "",
      Time: vehicle.time || "",
      "Last Update": vehicle.packet_datetime || "",
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(exportData[0]).join(","),
        ...exportData.map((row) =>
          Object.values(row)
            .map((value) => `"${value}"`)
            .join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `vehicle_tracking_report_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        fontWeight={700}
        mb={3}
      >
        Vehicle Tracking Report
      </Typography>

      {/* FILTER SECTION */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Vehicle No"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Owner"
                value={owner}
                onChange={(e) =>
                  setOwner(e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>
                  Category
                </InputLabel>

                <Select
                  value={category}
                  label="Category"
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                >
                  <MenuItem value="">
                    All
                  </MenuItem>

                  <MenuItem value="Ambulance">
                    Ambulance
                  </MenuItem>

                  <MenuItem value="Bus">
                    Bus
                  </MenuItem>

                  <MenuItem value="Truck">
                    Truck
                  </MenuItem>

                  <MenuItem value="Taxi">
                    Taxi
                  </MenuItem>

                  <MenuItem value="Police">
                    Police
                  </MenuItem>

                  <MenuItem value="School bus">
                    School Bus
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <Autocomplete
                options={poiTypes}
                loading={poiTypeLoading}
                value={selectedPoiType}
                onChange={handlePoiTypeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="POI Type"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <Autocomplete
                options={poiOptions}
                loading={poiLoading}
                value={selectedPoi}
                disabled={!selectedPoiType}
                getOptionLabel={(option) =>
                  option?.name || ""
                }
                onInputChange={(
                  event,
                  value,
                  reason
                ) => {
                  if (
                    reason === "input" &&
                    selectedPoiType
                  ) {
                    fetchPois(value);
                  }
                }}
                onChange={(
                  event,
                  value
                ) => {
                  setSelectedPoi(value);

                  setSelectedPoiId(
                    value?.id || ""
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="POI"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={startDateTime}
                onChange={(e) =>
                  setStartDateTime(e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={endDateTime}
                onChange={(e) =>
                  setEndDateTime(e.target.value)
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLE */}

      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="flex-end"
            mb={2}
          >
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export Data
            </Button>
          </Box>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              py={5}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: "70vh",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Vehicle No
                      </TableCell>

                      <TableCell>
                        IMEI
                      </TableCell>

                      <TableCell>
                        Owner
                      </TableCell>

                      <TableCell>
                        Category
                      </TableCell>

                      <TableCell>
                        Make
                      </TableCell>

                      <TableCell>
                        Speed
                      </TableCell>

                      <TableCell>
                        GPS Status
                      </TableCell>

                      <TableCell>
                        Ignition
                      </TableCell>

                      <TableCell>
                        Latitude
                      </TableCell>

                      <TableCell>
                        Longitude
                      </TableCell>
                      <TableCell>
                        Date
                      </TableCell>
                      <TableCell>
                        Time
                      </TableCell>

                      <TableCell>
                        Last Update
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {noData ? (
                      <TableRow>
                        <TableCell
                          colSpan={13}
                          align="center"
                        >
                          No Data Found
                        </TableCell>
                      </TableRow>
                    ) : (filteredVehicles
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage +
                        rowsPerPage
                      )
                      .map((vehicle) => (
                        <TableRow
                          key={vehicle.imei}
                          hover
                        >
                          <TableCell>
                            {
                              vehicle.vehicle_registration_number
                            }
                          </TableCell>

                          <TableCell>
                            {vehicle.imei}
                          </TableCell>

                          <TableCell>
                            {vehicle
                              ?.device_tag_info
                              ?.vehicle_owner
                              ?.users?.[0]
                              ?.name || "-"}
                          </TableCell>

                          <TableCell>
                            {vehicle
                              ?.device_tag_info
                              ?.category_info
                              ?.category || "-"}
                          </TableCell>

                          <TableCell>
                            {vehicle
                              ?.device_tag_info
                              ?.vehicle_make ||
                              "-"}
                          </TableCell>

                          <TableCell>
                            {vehicle.speed}
                          </TableCell>

                          <TableCell>
                            {vehicle.gps_status ===
                              "1"
                              ? "Online"
                              : "Offline"}
                          </TableCell>

                          <TableCell>
                            {vehicle.ignition_status ===
                              "1"
                              ? "ON"
                              : "OFF"}
                          </TableCell>

                          <TableCell>
                            {vehicle.latitude}
                          </TableCell>

                          <TableCell>
                            {vehicle.longitude}
                          </TableCell>
                          <TableCell>
                            {vehicle.date}
                          </TableCell>
                          <TableCell>
                            {vehicle.time}
                          </TableCell>

                          <TableCell>
                            {
                              vehicle.packet_datetime
                            }
                          </TableCell>
                        </TableRow>
                      )))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={
                  filteredVehicles.length
                }
                page={page}
                rowsPerPage={
                  rowsPerPage
                }
                onPageChange={(
                  event,
                  newPage
                ) =>
                  setPage(newPage)
                }
                onRowsPerPageChange={(
                  event
                ) => {
                  setRowsPerPage(
                    parseInt(
                      event.target.value,
                      10
                    )
                  );
                  setPage(0);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}