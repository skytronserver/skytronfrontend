import React, { useEffect, useState, useRef } from "react";
import MainCard from "../../ui-component/cards/MainCard";
import HomePageService from "../../services/HomePage";
import TaggingService from "../../services/TaggingService";
import {
  MenuItem,
  Button,
  Grid,
  TextField,
  Select,
  Box,
  Autocomplete,
} from "@mui/material";
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { TileWMS, XYZ } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import AutoHideAlert from "../../ui-component/AutoHideAlert";
import { useTranslation } from "react-i18next";

const resolveBhuvanWmsUrl = () => {
  const envUrl = process.env.REACT_APP_BHUVAN_URL;
  if (!envUrl) {
    return "https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms";
  }

  const normalizedUrl = envUrl.replace(/\/$/, "");
  if (normalizedUrl.includes("/bhuvan/gwc/service/wms")) {
    return normalizedUrl;
  }

  return `${normalizedUrl}/bhuvan/gwc/service/wms`;
};

const createBhuvanSource = (layerName) => {
  const options = {
    url: resolveBhuvanWmsUrl(),
    params: {
      LAYERS: layerName,
      STYLES: "",
      TILED: true,
      VERSION: "1.1.1",
      FORMAT: "image/png",
      TRANSPARENT: "true",
      SRS: "EPSG:4326",
      WIDTH: 256,
      HEIGHT: 256,
    },
    serverType: "geoserver",
    projection: "EPSG:4326",
    transition: 0,
  };

  if (process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true") {
    options.crossOrigin = "anonymous";
  }

  return new TileWMS(options);
};

const RouteFixing = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [routeContent, setRouteContent] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newPoints, setNewPoints] = useState([]); // Store coordinates of points
  const [routeStats, setRouteStats] = useState({ distance: 0, travelTime: 0 });
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const map = useRef(null);
  const overlayRef = useRef(null);
  const selectedId = useRef("");

  // Map Layers Refs
  const normalLayersRef = useRef([]);
  const satelliteLayerRef = useRef(null);
  const [mapType, setMapType] = useState("normal"); // 'normal' or 'satellite'

  const [alert, setAlert] = useState({
    open: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    const fetchDeviceList = async () => {
      const retriveData = await TaggingService.getOwnerList();
      setDeviceList(retriveData.data);
    };
    fetchDeviceList();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deviceId) {
      setAlert({
        open: true,
        message: "Please select a vehicle before loading routes.",
        type: "error",
      });
      return;
    }
    retriveRouteData(deviceId);
  };

  const retriveRouteData = async (id) => {
    try {
      const retriveData = await HomePageService.getRouteFixing(id);
      setRouteContent(retriveData.data);
      setRouteData(retriveData.data.route || []);
      setLoad(true);
    } catch (error) {
      console.error("Error retrieving route data:", error);
    }
  };

  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
    setSelectedRoute(null); // Clear selected route on device change
  };

  const handleRouteSelect = (event) => {
    try {
      const [routeId, routeRout] = event.target.value.split("|");

      const coordinates = routeRout
        .split("],")
        .map(coord => {
          try {
            return coord
              .replace(/[\[\]']/g, '')
              .split(',')
              .map(num => {
                const parsed = parseFloat(num.trim());
                if (isNaN(parsed)) throw new Error('Invalid coordinate value');
                return parsed;
              });
          } catch (e) {
            console.error('Error parsing coordinate:', coord);
            return null;
          }
        })
        .filter(coord => coord && coord.length >= 2)
        .map(coord => [coord[0], coord[1]]);

      if (coordinates.length < 2) {
        throw new Error('Not enough valid coordinates to create a route');
      }

      setSelectedRoute({
        routeId,
        coordinates, // Store the parsed coordinates
        routeRout
      });
      loadRoute(coordinates, routeId);
    } catch (error) {
      console.error('Error selecting route:', error);
      alert('There was an error selecting the route. Please try again.');
    }
  };

  // Initialize map on first render
  useEffect(() => {
    if (!map.current) {
      // Create Bhuvan Layers (Normal)
      const india3Layer = new TileLayer({
        source: createBhuvanSource("india3"),
        visible: true,
      });

      const adminGroupLayer = new TileLayer({
        source: createBhuvanSource("basemap:admin_group"),
        visible: true,
      });

      const mmiLayer = new TileLayer({
        source: createBhuvanSource("mmi:mmi_india"),
        visible: true,
      });

      // Create Satellite Layer
      const satelliteLayer = new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attributions: "© Esri",
          maxZoom: 18,
        }),
        visible: false,
      });

      // Store refs
      normalLayersRef.current = [india3Layer, adminGroupLayer, mmiLayer];
      satelliteLayerRef.current = satelliteLayer;

      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          india3Layer,
          adminGroupLayer,
          mmiLayer,
          satelliteLayer
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
          zoom: 7,
        }),

        pixelRatio: 1,
      });


      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
      });

      initialMap.addLayer(vectorLayer);
      map.current = initialMap;

      // Initialize overlay for popup
      const overlay = new Overlay({
        element: overlayRef.current,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -15],
      });
      initialMap.addOverlay(overlay);
    }
    // Add click event for adding new route points only if vehicle is selected else not allow to select point
    if (deviceId != "") {
      map.current.on("click", (e) => {
        const coord = e.coordinate;
        addPoint(coord);
      });
    }
  }, [deviceId]);

  // Handle Map Type Toggle
  useEffect(() => {
    if (map.current) {
      const isNormal = mapType === "normal";

      normalLayersRef.current.forEach(layer => layer.setVisible(isNormal));
      satelliteLayerRef.current.setVisible(!isNormal);
    }
  }, [mapType]);

  // Function to load route on the map
  const loadRoute = (route, routeId) => {
    try {
      if (!route || route.length < 2) {
        console.warn('Invalid route data: Need at least 2 points to display a route');
        return;
      }

      selectedId.current = routeId;
      vectorSourceRef.current.clear();

      // Calculate route statistics
      const stats = calculateRouteStats(route);
      setRouteStats(stats);

      // Create point features only for start and end points
      const startPoint = new Feature({
        geometry: new Point(fromLonLat(route[0])),
      });
      const endPoint = new Feature({
        geometry: new Point(fromLonLat(route[route.length - 1])),
      });

      // Set style for start and end points
      [startPoint, endPoint].forEach(point => {
        point.setStyle(
          new Style({
            image: new Icon({
              src: `${process.env.REACT_APP_BASE_URL}static/track.png`,
              scale: 0.051,
              anchor: [0.5, 1],
              anchorXUnits: "fraction",
              anchorYUnits: "fraction",
            }),
          })
        );
      });

      vectorSourceRef.current.addFeatures([startPoint, endPoint]);

      // Create and add the route line
      const coordinates = route.map(coords => fromLonLat(coords));

      if (coordinates.some(coord => !coord || coord.length < 2)) {
        throw new Error('Invalid coordinates in route');
      }

      const line = new Feature({
        geometry: new LineString(coordinates),
      });

      line.setStyle(new Style({
        stroke: new Stroke({
          color: '#0066ff',
          width: 3
        })
      }));

      vectorSourceRef.current.addFeature(line);

      // Get the extent and verify it's valid before fitting
      const extent = line.getGeometry().getExtent();
      if (extent && extent.every(coord => typeof coord === 'number' && !isNaN(coord))) {
        map.current.getView().fit(extent, {
          padding: [50, 50, 50, 50],
          duration: 1000,
          maxZoom: 18
        });
      } else {
        console.warn('Invalid extent calculated for route');
      }
    } catch (error) {
      console.error('Error loading route:', error);
      alert('There was an error loading the route. Please try again.');
    }
  };

  // Add a point on the map and update state
  const addPoint = (coord) => {
    const pointCoordinates = toLonLat(coord); // Convert to lon/lat before storing
    setNewPoints((prevPoints) => {
      const updatedPoints = [...prevPoints, pointCoordinates];
      updateRouteLine(updatedPoints); // Update the map with the new points
      return updatedPoints;
    });
  };

  // Update route line based on new points
  const updateRouteLine = (points) => {
    vectorSourceRef.current.clear();

    // Create features from the stored coordinates
    const pointFeatures = points.map((coords) => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat(coords)), // Convert back to map projection
      });

      pointFeature.setStyle(
        new Style({
          image: new Icon({
            src: require("../../assets/images/grey/bus.png"),
            scale: 0.051,
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
          }),
        })
      );
      return pointFeature;
    });

    // Add the new point features to the map
    vectorSourceRef.current.addFeatures(pointFeatures);

    // Create and add the route line if we have more than one point
    if (points.length > 1) {
      const lineCoordinates = points.map((coords) => fromLonLat(coords));
      const lineFeature = new Feature({
        geometry: new LineString(lineCoordinates),
      });
      vectorSourceRef.current.addFeature(lineFeature);

      // Calculate and update route statistics for new route
      const stats = calculateRouteStats(points);
      setRouteStats(stats);
    } else {
      // Reset stats if less than 2 points
      setRouteStats({ distance: 0, travelTime: 0 });
    }
  };

  const addRoute = async () => {
    if (newPoints.length < 2) {
      setAlert({
        open: true,
        message: "Please add at least two points to create a route.",
        type: "error"
      });
      return;
    }

    try {
      const routeResponse = await HomePageService.getRoute({ points: newPoints });
      const routeData = routeResponse?.data?.data && routeResponse.data.data.paths ? routeResponse.data.data : routeResponse.data;
      console.log('Route Data:', routeData);

      // Check if we have valid paths data (API returns data.paths[0].points.coordinates)
      if (!routeData?.paths?.[0]?.points?.coordinates) {
        throw new Error('Invalid route data received');
      }

      const firstPath = routeData.paths[0];
      const coordinates = firstPath.points.coordinates;

      const response = await HomePageService.addRoute({
        device_id: deviceId,
        route: coordinates,
        routepoints: newPoints,
        hash: routeData.hash
      });

      setRouteData(response.data.route);
      setNewPoints([]);
      vectorSourceRef.current.clear();
      setAlert({
        open: true,
        message: "Route added successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error adding new route:", error);
      setAlert({
        open: true,
        message: error.message || "Failed to add route. Please try again.",
        type: "error"
      });
    }
  };
  const handleAutocompleteChange = (event, newValue) => {
    // If a valid option is selected, pass the device ID to the change handler
    if (newValue) {
      handleDeviceChange({ target: { value: newValue.device.id } });
    }
  };
  const delRoute = async () => {
    if (!selectedRoute) {
      setAlert({
        open: true,
        message: "Please select a route to delete.",
        type: "error"
      });
      return;
    }

    const data = {
      id: selectedRoute.routeId,
      device_id: deviceId,
    };
    try {
      await HomePageService.delRoute(data);
      setRouteData(
        routeData.filter((route) => route.id != selectedRoute.routeId)
      );
      setSelectedRoute(null);
      vectorSourceRef.current.clear(); // Clear the route from map
      setAlert({
        open: true,
        message: "Route deleted successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error deleting route:", error);
      setAlert({
        open: true,
        message: "Failed to delete route. Please try again.",
        type: "error"
      });
    }
  };

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Function to calculate total route distance and travel time
  const calculateRouteStats = (coordinates) => {
    if (!coordinates || coordinates.length < 2) {
      return { distance: 0, travelTime: 0 };
    }

    let totalDistance = 0;
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lat1, lon1] = coordinates[i];
      const [lat2, lon2] = coordinates[i + 1];
      totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }

    const averageSpeed = 40; // km/hr
    const travelTimeHours = totalDistance / averageSpeed;
    const travelTimeMinutes = Math.round(travelTimeHours * 60);

    return {
      distance: Math.round(totalDistance * 100) / 100, // Round to 2 decimal places
      travelTime: travelTimeMinutes
    };
  };

  // Function to format travel time for display
  const formatTravelTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  };

  const exportRoutesToJSON = () => {
    if (!routeData || routeData.length === 0) {
      setAlert({
        open: true,
        message: "No routes available to export.",
        type: "error"
      });
      return;
    }

    try {
      // Get the selected device info
      const selectedDevice = deviceList.find((item) => item.device.id === deviceId);

      // Prepare export data
      const exportData = {
        device_info: {
          device_id: deviceId,
          vehicle_reg_no: selectedDevice?.vehicle_reg_no || "",
          export_timestamp: new Date().toISOString(),
        },
        routes: routeData.map((route) => {
          // Parse route coordinates
          let coordinates = [];
          try {
            coordinates = route.route
              .split("],")
              .map(coord => {
                return coord
                  .replace(/[\[\]']/g, '')
                  .split(',')
                  .map(num => parseFloat(num.trim()))
                  .filter(num => !isNaN(num));
              })
              .filter(coord => coord && coord.length >= 2);
          } catch (e) {
            console.error('Error parsing route coordinates:', e);
          }

          // Calculate travel statistics for export
          const stats = calculateRouteStats(coordinates);

          return {
            route_id: route.id,
            coordinates: coordinates,
            raw_route: route.route,
            distance_km: stats.distance,
            travel_time_minutes: stats.travelTime,
            travel_time_formatted: formatTravelTime(stats.travelTime),
            average_speed_kmh: 40,
            created_at: route.created_at || null,
            updated_at: route.updated_at || null
          };
        })
      };

      // Create and download JSON file
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `routes_${selectedDevice?.vehicle_reg_no || deviceId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAlert({
        open: true,
        message: "Routes exported successfully!",
        type: "success"
      });
    } catch (error) {
      console.error("Error exporting routes:", error);
      setAlert({
        open: true,
        message: "Failed to export routes. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <MainCard>
      <AutoHideAlert
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        message={alert.message}
        type={alert.type}
      />
      <p>{t('routeFixing.title')}</p>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Autocomplete
              value={
                deviceList.find((item) => item.device.id === deviceId) || null
              }
              onChange={handleAutocompleteChange}
              options={deviceList}
              getOptionLabel={(option) => option.vehicle_reg_no || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('routeFixing.selectVehicle')}
                  variant="outlined"
                  fullWidth
                  margin="normal"
                />
              )}
              noOptionsText={t('routeFixing.noVehicleOptions')}
              isOptionEqualToValue={(option, value) =>
                option.device.id === value.device.id
              }
              disableClearable
            />
          </Grid>

          <Grid item md={2} sm={12} xs={12} style={{ marginTop: "38px" }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ height: "48px" }}
            >
              {t('routeFixing.buttons.submit')}
            </Button>
          </Grid>
        </Grid>
      </form>


      {load && (
        <Box className="button-container" sx={{ mt: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item md={6} sm={12} xs={12}>
              <Select
                id="routeDropdown"
                value={selectedRoute ? `${selectedRoute.routeId}|${selectedRoute.routeRout}` : ""}
                onChange={handleRouteSelect}
                displayEmpty
                fullWidth
              >
                <MenuItem value="" disabled>
                  View route
                </MenuItem>
                {routeData.map((route) => {
                  // Calculate stats for each route to show in dropdown
                  let routePreview = `Route #${route.id}`;
                  try {
                    const coordinates = route.route
                      .split("],")
                      .map(coord => {
                        return coord
                          .replace(/[\[\]']/g, '')
                          .split(',')
                          .map(num => parseFloat(num.trim()))
                          .filter(num => !isNaN(num));
                      })
                      .filter(coord => coord && coord.length >= 2);

                    if (coordinates.length >= 2) {
                      const stats = calculateRouteStats(coordinates);
                      routePreview += ` (${stats.distance}km, ${formatTravelTime(stats.travelTime)})`;
                    }
                  } catch (e) {
                    // If parsing fails, just show route ID
                  }

                  return (
                    <MenuItem
                      value={`${route.id}|${route.route}`}
                      key={route.id}
                    >
                      {routePreview}
                    </MenuItem>
                  );
                })}
              </Select>
            </Grid>
            <Grid item md={2} sm={6} xs={6}>
              <Button
                onClick={delRoute}
                variant="contained"
                color="secondary"
                fullWidth
              >
                Delete Route
              </Button>
            </Grid>
            <Grid item md={2} sm={6} xs={6}>
              <Button onClick={addRoute} variant="contained" color="primary" fullWidth>
                Add Route
              </Button>
            </Grid>
            <Grid item md={2} sm={6} xs={6}>
              <Button
                onClick={exportRoutesToJSON}
                variant="contained"
                color="info"
                fullWidth
              >
                Export Route
              </Button>

            </Grid>
            <Grid item md={2} sm={6} xs={6}>
              <Button
                onClick={() => setMapType(prev => prev === "normal" ? "satellite" : "normal")}
                variant="contained"
                color="inherit" // Use a neutral color or customize
                fullWidth
                sx={{
                  bgcolor: mapType === "normal" ? 'grey.300' : 'grey.800',
                  color: mapType === "normal" ? 'black' : 'white',
                  '&:hover': {
                    bgcolor: mapType === "normal" ? 'grey.400' : 'grey.900',
                  }
                }}
              >
                {mapType === "normal" ? "Satellite View" : "Normal View"}
              </Button>
            </Grid>
          </Grid>

          {/* Route Statistics Display */}
          {selectedRoute && routeStats.distance > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <strong>Distance:</strong>
                    <span>{routeStats.distance} km</span>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <strong>Estimated Travel Time:</strong>
                    <span>{formatTravelTime(routeStats.travelTime)}</span>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}>
                    *Time is calculated on average speed of 40 km/hr
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      )}


      <Box ref={mapRef} id="map" sx={{ width: "100%", height: "500px", mt: 4, position: 'relative' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />
      </Box>

      <div
        ref={overlayRef}
        className="popup-container"
        style={{ display: "none", position: "absolute", zIndex: 1000 }}
      >
        <div
          className="popup-menu"
          style={{
            backgroundColor: "white",
            border: "1px solid black",
            padding: "5px",
          }}
        >
          <div id="delete">Delete</div>
          <div id="cancel">Cancel</div>
        </div>
      </div>
    </MainCard >
  );
};

export default RouteFixing;