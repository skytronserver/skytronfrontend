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
import { OSM, TileWMS } from "ol/source";
import { fromLonLat, toLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Overlay from "ol/Overlay";
import Icon from "ol/style/Icon";
import Style from "ol/style/Style";

const RouteFixing = () => {
  const [load, setLoad] = useState(false);
  const [routeContent, setRouteContent] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [deviceList, setDeviceList] = useState([]);
  const [deviceId, setDeviceId] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [newPoints, setNewPoints] = useState([]); // Store coordinates of points
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const map = useRef(null);
  const overlayRef = useRef(null);
  const selectedId = useRef("");

  useEffect(() => {
    const fetchDeviceList = async () => {
      const retriveData = await TaggingService.getOwnerList();
      setDeviceList(retriveData.data);
    };
    fetchDeviceList();
  }, []);

  const handleSubmit = async (e) => {
    console.log("deviceId",deviceId);
    e.preventDefault();
    retriveRouteData(deviceId);
  };

  const retriveRouteData = async (id) => {
    try {
      const retriveData = await HomePageService.getRouteFixing(id);
      setRouteContent(retriveData.data);
      setRouteData(retriveData.data.route || []);

      console.log("route data ", retriveData.data);
      setLoad(true)
    } catch (error) {
      console.log("Error retrieving route data:", error);
    }
  };

  const handleDeviceChange = (e) => {
    setDeviceId(e.target.value);
    setSelectedRoute(null); // Clear selected route on device change
  };

  const handleRouteSelect = (event) => {
    const [routeId, routeRout] = event.target.value.split("|");
    setSelectedRoute({ routeId, routeRout });
    loadRoute(JSON.parse(routeRout), routeId);
  };

  // Initialize map on first render
  useEffect(() => {
    if (!map.current) {
      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new TileLayer({
            source: new TileWMS({
              url: process.env.REACT_APP_BHUVAN_URL,
              params: {
                'LAYERS': 'basemap%3Aadmin_group',
                'TILED': true,
                'VERSION': '1.1.1',
                'FORMAT': 'image/png',
                'TRANSPARENT': 'true',
                'SRS': 'EPSG:4326',
                'WIDTH': 256,   // Set the tile width to 256 pixels
                'HEIGHT': 256,   // Set the tile height to 256 pixels
                'pixelRatio': 1,

              },
              serverType: 'geoserver',
              projection: 'EPSG:4326', // Ensure the projection is set:' 



            })
          }),
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

  // Function to load route on the map
  const loadRoute = (route, routeId) => {
    selectedId.current = routeId;
    vectorSourceRef.current.clear();

    const points = route.map(
      (coords) =>
        new Feature({
          geometry: new Point(fromLonLat(coords)),
        })
    );
    vectorSourceRef.current.addFeatures(points);

    if (points.length > 1) {
      const coordinates = points.map((point) =>
        point.getGeometry().getCoordinates()
      );
      const line = new Feature({
        geometry: new LineString(coordinates),
      });
      vectorSourceRef.current.addFeature(line);
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
            src: `${process.env.REACT_APP_BASE_URL}static/track.png` , 
            scale: 0.051,
            anchor: [0.5, 1], // Horizontal center and bottom edge as anchor point
            anchorXUnits: "fraction", // Anchor unit is fraction of the icon's width
            anchorYUnits: "fraction", // Anchor unit is fraction of the icon's height
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
    }
  };

  const addRoute = async () => {
    if (newPoints.length < 2) {
      alert("Please add at least two points to create a route.");
      return;
    }
    const data = {
      device_id: deviceId,
      route: JSON.stringify(newPoints), // Serializing newPoints as JSON
    };

    try {
      const response = await HomePageService.addRoute(data);
      console.log("New Route Added:", response);
      setRouteData(response.data.route); // Update route data with the new route
      setNewPoints([]); // Clear new points after adding route
    } catch (error) {
      console.error("Error adding new route:", error);
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
      alert("Please select a route to delete.");
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
      ); // Remove the deleted route from list
      setSelectedRoute(null); // Clear selected route
      console.log("Route deleted");
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };
  return (
    <MainCard>
      <p>Route Fixing</p>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2} className="form-controller">
          <Grid item md={4} sm={12} xs={12} style={{ marginTop: "20px" }}>
            <Autocomplete
              value={
                deviceList.find((item) => item.device.id === deviceId) || null
              }
              onChange={handleAutocompleteChange}
              options={inputValue ? deviceList : []} // Show options only when inputValue is not empty
              getOptionLabel={(option) => option.vehicle_reg_no || ""}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Vehicle Registration No"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  onChange={(e) => setInputValue(e.target.value)} // Update inputValue on change
                />
              )}
              noOptionsText="Enter Vehicle Registration No."
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
              Submit
            </Button>
          </Grid>
        </Grid>
      </form>

      {load && (
        <Box className="button-container" sx={{ mt: 3 }}>
          <Select
            id="routeDropdown"
            value={
              selectedRoute
                ? `${selectedRoute.routeId}|${selectedRoute.routeRout}`
                : ""
            }
            onChange={handleRouteSelect}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>
              Select a route
            </MenuItem>
            {routeData.map((route) => (
              <MenuItem value={`${route.id}|${route.route}`} key={route.id}>
                Route #{route.id}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ mt: 2 }}>
            <Button onClick={addRoute} variant="contained" color="primary">
              Add Route
            </Button>
            <Button
              onClick={delRoute}
              variant="contained"
              color="secondary"
              sx={{ ml: 2 }}
            >
              Delete Route
            </Button>
          </Box>
        </Box>
      )}


      <Box ref={mapRef} id="map" sx={{ width: "100%", height: "500px", mt: 4, position: 'relative' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png` } style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png` } style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />
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
    </MainCard>
  );
};

export default RouteFixing;
