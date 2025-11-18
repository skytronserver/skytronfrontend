import React, { useEffect, useRef, useState } from 'react';
import MainCard from '../../ui-component/cards/MainCard';
import HomePageService from "../../services/HomePage";
import TaggingService from "../../services/TaggingService";
import { useTranslation } from 'react-i18next';
import { FormControl, Autocomplete, TextField, Button, Grid, Box, Typography, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Slider, Stack, FormControlLabel, Checkbox, Skeleton, CircularProgress } from '@mui/material';
import { Map, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM, TileWMS } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import Overlay from 'ol/Overlay';
import "ol/ol.css";
import axios from 'axios';

const TripViewer = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleList, setVehicleList] = useState([]);
  const [tripSummary, setTripSummary] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [timeFilter, setTimeFilter] = useState('day');
  const [trips, setTrips] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [activeLayers, setActiveLayers] = useState({
    osm: true,
    india3: true,
    indiaBase: true,
    indiaRoads: true,
    markers: true
  });
  const [showMap, setShowMap] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const mapRef = useRef(null);
  const map = useRef(null);
  const vectorSourceRef = useRef(new VectorSource());
  const overlayRef = useRef(null);
  const animationIntervalId = useRef(null);
  const layersRef = useRef({
    osm: null,
    india3: null,
    indiaBase: null,
    indiaRoads: null,
    markers: null
  });

  // Fetch vehicle list on component mount
  useEffect(() => {
    const fetchVehicleList = async () => {
      try {
        console.log('Fetching vehicle list...');
        const response = await TaggingService.getOwnerList({});
        console.log('Vehicle list response:', response);
        
        if (response) {
          // Handle both array and object responses
          const vehicles = Array.isArray(response) ? response : response.data || [];
          console.log('Processed vehicles:', vehicles);
          
          // Transform the vehicles from tag_ownerlist API format
          const transformedVehicles = vehicles.map(vehicle => {
            return {
              id: vehicle.id, // This is the tag ID
              device_id: vehicle.device?.id,
              device_tag_id: vehicle.id, // Use tag ID as device_tag_id
              vehicle_reg_no: vehicle.vehicle_reg_no,
              vehicle_owner: vehicle.vehicle_owner,
              device: vehicle.device,
              label: `${vehicle.vehicle_reg_no} (${vehicle.device?.device_esn || 'N/A'})`
            };
          });
          
          console.log('Transformed vehicles:', transformedVehicles);
          setVehicleList(transformedVehicles);
          setLoad(true);
        }
      } catch (error) {
        console.error('Error fetching vehicle list:', error);
        setLoad(true);
      }
    };
    fetchVehicleList();
  }, []);

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !map.current && showMap) {
      console.log('Initializing map...');
      const initialMap = new Map({
        target: mapRef.current,
        layers: [],
        view: new View({
          center: fromLonLat([78.9629, 20.5937]), // Center of India
          zoom: 5,
        }),
      });

      // Initialize overlay for popup
      const overlay = new Overlay({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -15],
      });
      initialMap.addOverlay(overlay);
      overlayRef.current = overlay;

      // Create and store all layers
      const osmLayer = new TileLayer({
        source: new OSM(),
        visible: activeLayers.osm
      });

      const india3Layer = new TileLayer({
        source: new TileWMS({
          url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
          params: {
            'LAYERS': 'india3',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
            'pixelRatio': 1,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: 'anonymous'
        }),
        visible: activeLayers.india3
      });

      const indiaBaseLayer = new TileLayer({
        source: new TileWMS({
          url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
          params: {
            'LAYERS': 'basemap%3Aadmin_group',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
            'pixelRatio': 1,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: 'anonymous'
        }),
        visible: activeLayers.indiaBase
      });

      const indiaRoadsLayer = new TileLayer({
        source: new TileWMS({
          url: process.env.REACT_APP_BHUVAN_URL || 'https://bhuvan-vec1.nrsc.gov.in/bhuvan/gwc/service/wms',
          params: {
            'LAYERS': 'mmi:mmi_india',
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
            'pixelRatio': 1,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          crossOrigin: 'anonymous'
        }),
        visible: activeLayers.indiaRoads
      });

      const vectorLayer = new VectorLayer({
        source: vectorSourceRef.current,
        visible: true
      });

      // Store layer references
      layersRef.current = {
        osm: osmLayer,
        india3: india3Layer,
        indiaBase: indiaBaseLayer,
        indiaRoads: indiaRoadsLayer,
        markers: vectorLayer
      };

      // Add layers to map
      initialMap.addLayer(osmLayer);
      initialMap.addLayer(india3Layer);
      initialMap.addLayer(indiaBaseLayer);
      initialMap.addLayer(indiaRoadsLayer);
      initialMap.addLayer(vectorLayer);      map.current = initialMap;
      
      // Add load event handler
      initialMap.once('loadend', () => {
        console.log('Map loaded successfully');
      });

      initialMap.on('error', (error) => {
        console.error('Map loading error:', error);
      });
    }
  }, [showMap]);

  const formatNumber = (value, fractionDigits = 2) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toFixed(fractionDigits);
  };

  const formatDateTime = (value) => {
    if (!value) return '--';
    try {
      return new Date(value).toLocaleString();
    } catch (error) {
      return value;
    }
  };

  const normalizePoint = (point = {}) => {
    const lat = parseFloat(point.lat ?? point.latitude ?? point.Latitude ?? point.latitute);
    const lon = parseFloat(point.lon ?? point.longitude ?? point.Longitude ?? point.longitute);

    return {
      ...point,
      lat,
      lon,
      s: point.s ?? point.speed ?? point.Speed ?? 0,
      h: point.h ?? point.heading ?? point.Heading ?? 0,
      et: point.et ?? point.timestamp ?? point.time ?? point.event_time ?? ''
    };
  };

  // Format trip data from ET API response
  const formatTripData = (tripResponse) => {
    if (!tripResponse || !Array.isArray(tripResponse.trips)) return [];

    return tripResponse.trips.map((trip, index) => {
      const rawPoints = trip.gps_points || trip.data_points || [];
      const fallbackPoints = (!rawPoints.length && trip.start_location && trip.end_location) ? [
        {
          latitude: trip.start_location.latitude,
          longitude: trip.start_location.longitude,
          timestamp: trip.start_time,
        },
        {
          latitude: trip.end_location.latitude,
          longitude: trip.end_location.longitude,
          timestamp: trip.end_time,
        }
      ] : [];

      const normalizedPoints = (rawPoints.length ? rawPoints : fallbackPoints)
        .map(normalizePoint)
        .filter(point => Number.isFinite(point.lat) && Number.isFinite(point.lon));

      const distanceKm = trip.distance_km ?? trip.total_distance ?? 0;
      const durationMinutes = trip.duration_minutes ?? trip.duration ?? 0;
      const averageSpeed = trip.average_speed_kmh ?? trip.average_speed ?? 0;

      return {
        id: trip.trip_id ?? trip.id ?? index,
        points: normalizedPoints,
        stats: {
          distance: formatNumber(distanceKm),
          duration: formatNumber(durationMinutes),
          averageSpeed: formatNumber(averageSpeed),
          startTime: formatDateTime(trip.start_time),
          endTime: formatDateTime(trip.end_time),
          points: trip.total_data_points ?? normalizedPoints.length
        }
      };
    });
  };

  // Fetch trip data using new ET trip list API
  const fetchTripData = async () => {
    if (!selectedVehicle) {
      console.error('No vehicle selected');
      return;
    }
    
    // Use device_tag_id if available, otherwise use device_id, otherwise use id
    const deviceIdentifier = selectedVehicle.device_tag_id || selectedVehicle.device_id || selectedVehicle.id;
    
    if (!deviceIdentifier) {
      console.error('No device identifier found for selected vehicle');
      return;
    }

    setInitialLoading(true);
    setShowMap(true);
    
    try {
      const endDate = new Date();
      let startDate = new Date();

      switch (timeFilter) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'static':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(startDate.getDate() - 1);
      }

      // Switch to skeleton loading after initial setup
      setInitialLoading(false);
      setLoadingTrips(true);

      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}api/device-trip-details/`,
        {
          params: {
            device_tag_id: deviceIdentifier,
            start_datetime: startDate.toISOString(),
            end_datetime: endDate.toISOString(),
          },
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${sessionStorage.getItem("oAuthToken")}`,
          },
        }
      );

      console.log('ET Trip data response:', response.data);

      if (response.data) {
        const summaryPayload = response.data;
        setTripSummary({
          totalTrips: summaryPayload.total_trips ?? summaryPayload.trips?.length ?? 0,
          totalDistance: formatNumber(summaryPayload.total_distance_km ?? summaryPayload.total_distance ?? 0),
          totalDuration: formatNumber(summaryPayload.total_duration_minutes ?? summaryPayload.total_duration ?? 0),
          totalDataPoints: summaryPayload.total_data_points ?? 0,
          queryStart: summaryPayload.query_start_time ?? startDate.toISOString(),
          queryEnd: summaryPayload.query_end_time ?? endDate.toISOString(),
        });

        const formattedTrips = formatTripData(summaryPayload);
        console.log('Formatted trips:', formattedTrips);
        
        setTrips(formattedTrips);
        
        if (formattedTrips.length > 0) {
          const firstTrip = formattedTrips[0];
          setSelectedTrip(firstTrip);
          setSliderValue(0);
          const pointsLength = firstTrip.points?.length || 0;
          setMaxSliderValue(pointsLength > 0 ? pointsLength - 1 : 0);
          if (pointsLength > 0) {
            visualizeTrip(firstTrip.points);
          } else {
            vectorSourceRef.current.clear();
          }
        } else {
          setSelectedTrip(null);
          setSliderValue(0);
          setMaxSliderValue(0);
          vectorSourceRef.current.clear();
        }
      } else {
        setTripSummary(null);
        setTrips([]);
        setSelectedTrip(null);
        vectorSourceRef.current.clear();
      }
    } catch (error) {
      console.error('Error fetching ET trip data:', error);
      setTripSummary(null);
      setTrips([]);
      setSelectedTrip(null);
      vectorSourceRef.current.clear();
    } finally {
      setLoadingTrips(false);
    }
  };

  // Visualize trip on map
  const visualizeTrip = (points = []) => {
    if (!map.current || !points.length) return;

    // Clear existing features
    vectorSourceRef.current.clear();

    const validPoints = points.filter(point =>
      Number.isFinite(parseFloat(point.lon)) && Number.isFinite(parseFloat(point.lat))
    );

    if (!validPoints.length) {
      return;
    }

    // Create point features
    const pointFeatures = validPoints.map((point, index) => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([parseFloat(point.lon), parseFloat(point.lat)])),
        data: point
      });

      // Style for start and end points
      if (index === 0) {
        feature.setStyle(new Style({
          image: new Icon({
            src: `${process.env.REACT_APP_BASE_URL}static/start.png`,
            scale: 0.5,
            anchor: [0.5, 1],
            crossOrigin: 'anonymous'
          })
        }));
      } else if (index === points.length - 1) {
        feature.setStyle(new Style({
          image: new Icon({
            src: `${process.env.REACT_APP_BASE_URL}static/end.png`,
            scale: 0.5,
            anchor: [0.5, 1],
            crossOrigin: 'anonymous'
          })
        }));
      } else {
        feature.setStyle(new Style({
          image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color: '#0066ff' }),
            stroke: new Stroke({
              color: '#fff',
              width: 1
            })
          })
        }));
      }

      return feature;
    });

    // Create line feature
    const coordinates = validPoints.map(point => 
      fromLonLat([parseFloat(point.lon), parseFloat(point.lat)])
    );

    const lineFeature = new Feature({
      geometry: new LineString(coordinates)
    });

    lineFeature.setStyle(new Style({
      stroke: new Stroke({
        color: '#0066ff',
        width: 3
      })
    }));

    // Add all features to the source
    vectorSourceRef.current.addFeatures([...pointFeatures, lineFeature]);

    // Fit view to the trip extent
    const extent = lineFeature.getGeometry().getExtent();
    map.current.getView().fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 1000
    });
  };

  const handleVehicleChange = (event, newValue) => {
    console.log('Vehicle changed:', newValue);
    console.log('Available identifiers:', {
      device_tag_id: newValue?.device_tag_id,
      device_id: newValue?.device_id,
      id: newValue?.id
    });
    setSelectedVehicle(newValue);
  };

  const handleTimeFilterChange = (event) => {
    setTimeFilter(event.target.value);
  };

  const handleTripClick = (trip) => {
    setSelectedTrip(trip);
    setSliderValue(0);
    const pointsLength = trip.points?.length || 0;
    setMaxSliderValue(pointsLength > 0 ? pointsLength - 1 : 0);
    if (trip.points && trip.points.length > 0) {
      visualizeTrip(trip.points);
    } else {
      vectorSourceRef.current.clear();
    }
  };

  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    if (selectedTrip && selectedTrip.points[value]) {
      const point = selectedTrip.points[value];
      const coordinates = fromLonLat([parseFloat(point.lon), parseFloat(point.lat)]);
      map.current.getView().setCenter(coordinates);
      displayLocationData(point, coordinates);
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    let currentIndex = sliderValue;

    animationIntervalId.current = setInterval(() => {
      if (currentIndex < maxSliderValue) {
        currentIndex += 1;
        setSliderValue(currentIndex);
        const point = selectedTrip.points[currentIndex];
        if (point) {
          const coordinates = fromLonLat([parseFloat(point.lon), parseFloat(point.lat)]);
          map.current.getView().setCenter(coordinates);
          displayLocationData(point, coordinates);
        }
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, animationSpeed);
  };

  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
    setIsPlaying(false);
  };

  const restartAnimation = () => {
    setSliderValue(0);
    if (selectedTrip && selectedTrip.points[0]) {
      const point = selectedTrip.points[0];
      const coordinates = fromLonLat([parseFloat(point.lon), parseFloat(point.lat)]);
      map.current.getView().setCenter(coordinates);
      displayLocationData(point, coordinates);
    }
  };

  const displayLocationData = (data, coordinates) => {
    if (data) {
      const content = `
        <h4>Location Info</h4>
        <p><strong>Latitude:</strong> ${data.lat}</p>
        <p><strong>Longitude:</strong> ${data.lon}</p>
        <p><strong>Speed:</strong> ${data.s} km/h</p>
        <p><strong>Heading:</strong> ${data.h}</p>
        <p><strong>DateTime:</strong> ${data.et}</p>
      `;
      document.getElementById("overlay-content").innerHTML = content;
      map.current.getOverlays().getArray()[0].setPosition(coordinates);
      overlayRef.current.style.display = "block";
    }
  };

  // Function to toggle layer visibility
  const toggleLayer = (layerName) => {
    if (layersRef.current[layerName]) {
      const newVisibility = !layersRef.current[layerName].getVisible();
      layersRef.current[layerName].setVisible(newVisibility);
      setActiveLayers(prev => ({
        ...prev,
        [layerName]: newVisibility
      }));
    }
  };

  return (
    <MainCard>
      <Box sx={{ p: 3 }}>
        {/* Add overlay div for location info */}
        <div id="overlay-content" style={{
          position: 'absolute',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          display: 'none',
          zIndex: 1000,
          minWidth: '200px'
        }}></div>
        
        <Typography variant="h4" gutterBottom>
          {t('tripViewer.title')}
        </Typography>
        
        {/* Search and Filter Section */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={5}>
              <FormControl fullWidth>
                <Autocomplete
                  value={selectedVehicle}
                  onChange={handleVehicleChange}
                  options={vehicleList}
                  getOptionLabel={(option) => option.label || option.vehicle_reg_no || ''}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label={t('tripViewer.selectVehicle')} 
                      variant="outlined"
                      error={!load}
                      helperText={!load ? t('tripViewer.loading') : ''}
                    />
                  )}
                  noOptionsText={t('tripViewer.noVehicleOptions')}
                  loading={!load}
                  loadingText={t('tripViewer.loading')}
                  disableClearable
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <Select
                  value={timeFilter}
                  onChange={handleTimeFilterChange}
                  variant="outlined"
                >
                  <MenuItem value="day">{t('tripViewer.timeFilters.day')}</MenuItem>
                  <MenuItem value="week">{t('tripViewer.timeFilters.week')}</MenuItem>
                  <MenuItem value="month">{t('tripViewer.timeFilters.month')}</MenuItem>
                  <MenuItem value="static">{t('tripViewer.timeFilters.static')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                onClick={fetchTripData}
                disabled={initialLoading || loadingTrips}
                sx={{ height: '56px' }}
              >
                {initialLoading || loadingTrips ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t('tripViewer.buttons.submit')
                )}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {tripSummary && (
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('tripViewer.summary.title')}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('tripViewer.summary.totalTrips')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {tripSummary.totalTrips}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('tripViewer.summary.totalDistance')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {tripSummary.totalDistance} km
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('tripViewer.summary.totalDuration')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {tripSummary.totalDuration} min
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {t('tripViewer.summary.totalPoints')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {tripSummary.totalDataPoints ?? 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#e9f2ff', borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    {t('tripViewer.summary.timeRange')}
                  </Typography>
                  <Typography variant="body1" color="textPrimary">
                    {`${formatDateTime(tripSummary.queryStart)} - ${formatDateTime(tripSummary.queryEnd)}`}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}

        {showMap && (
          <>
            {/* Trips List Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('tripViewer.tripList')}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('tripViewer.table.startTime')}</TableCell>
                      <TableCell>{t('tripViewer.table.endTime')}</TableCell>
                      <TableCell>{t('tripViewer.table.distance')}</TableCell>
                      <TableCell>{t('tripViewer.table.duration')}</TableCell>
                      <TableCell>{t('tripViewer.table.speed')}</TableCell>
                      <TableCell>{t('tripViewer.table.points')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingTrips ? (
                      // Show skeleton loading animation
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                          <TableCell><Skeleton animation="wave" /></TableCell>
                        </TableRow>
                      ))
                    ) : trips.length > 0 ? (
                      trips.map((trip, index) => (
                        <TableRow 
                          key={index}
                          onClick={() => handleTripClick(trip)}
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { backgroundColor: '#f5f5f5' },
                            backgroundColor: selectedTrip === trip ? '#e3f2fd' : 'inherit'
                          }}
                        >
                          <TableCell>{trip.stats.startTime}</TableCell>
                          <TableCell>{trip.stats.endTime}</TableCell>
                          <TableCell>{trip.stats.distance} km</TableCell>
                          <TableCell>{trip.stats.duration} min</TableCell>
                          <TableCell>{trip.stats.averageSpeed} km/h</TableCell>
                          <TableCell>{trip.stats.points}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="textSecondary">
                            {t('tripViewer.noTripsFound') || 'No trips found for the selected criteria'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* Selected Trip Stats Section */}
            {selectedTrip && !loadingTrips && (
              <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t('tripViewer.stats.distance')}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {selectedTrip.stats.distance} km
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t('tripViewer.stats.duration')}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {selectedTrip.stats.duration} min
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        {t('tripViewer.stats.averageSpeed')}
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {selectedTrip.stats.averageSpeed} km/h
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )}            {/* Map Section */}
            <Paper elevation={2} sx={{ 
              position: 'relative', 
              height: '600px',
              width: '100%',
              overflow: 'hidden',
              '& .ol-map': {
                width: '100%',
                height: '100%'
              }
            }}>
              {initialLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    backdropFilter: 'blur(3px)'
                  }}
                >
                  <Box sx={{ textAlign: 'center', maxWidth: '400px', p: 3 }}>
                    {/* Animated Route/Map Icon */}
                    <Box
                      sx={{
                        width: '120px',
                        height: '120px',
                        margin: '0 auto 20px',
                        position: 'relative',
                        animation: 'pulse 2s ease-in-out infinite'
                      }}
                    >
                      {/* Animated Route Line */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '20%',
                          right: '20%',
                          height: '4px',
                          background: 'linear-gradient(90deg, #0066ff, #00ccff, #0066ff)',
                          borderRadius: '2px',
                          animation: 'routeFlow 3s linear infinite',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '-8px',
                            left: '0%',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#0066ff',
                            animation: 'moveDot 3s linear infinite'
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '-8px',
                            right: '0%',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#00ccff',
                            animation: 'moveDotReverse 3s linear infinite'
                          }
                        }}
                      />
                      
                      {/* Map Pin */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '20%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0',
                          height: '0',
                          borderLeft: '12px solid transparent',
                          borderRight: '12px solid transparent',
                          borderBottom: '20px solid #ff6b35',
                          animation: 'bounce 1.5s ease-in-out infinite'
                        }}
                      />
                      
                      {/* Compass */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '15%',
                          right: '15%',
                          width: '30px',
                          height: '30px',
                          border: '3px solid #0066ff',
                          borderRadius: '50%',
                          animation: 'rotate 4s linear infinite',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '2px',
                            height: '20px',
                            background: '#0066ff'
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '20px',
                            height: '2px',
                            background: '#0066ff'
                          }
                        }}
                      />
                    </Box>
                    
                    {/* Loading Text */}
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 2, 
                        color: '#2c3e50',
                        fontWeight: 600,
                        animation: 'fadeInOut 2s ease-in-out infinite'
                      }}
                    >
                      Please wait while we calculate your trip...
                    </Typography>
                    
                    {/* Progress Dots */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {[0, 1, 2].map((index) => (
                        <Box
                          key={index}
                          sx={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#0066ff',
                            animation: `dotPulse 1.4s ease-in-out infinite ${index * 0.2}s`
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* Additional Info */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 2, 
                        color: '#7f8c8d',
                        fontStyle: 'italic'
                      }}
                    >
                      Analyzing GPS data and route information
                    </Typography>
                  </Box>
                  
                  {/* CSS Animations */}
                  <style>
                    {`
                      @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                      }
                      
                      @keyframes routeFlow {
                        0% { background-position: -200px 0; }
                        100% { background-position: 200px 0; }
                      }
                      
                      @keyframes moveDot {
                        0% { left: 0%; }
                        100% { left: 100%; }
                      }
                      
                      @keyframes moveDotReverse {
                        0% { right: 0%; }
                        100% { right: 100%; }
                      }
                      
                      @keyframes bounce {
                        0%, 20%, 50%, 80%, 100% { transform: translateX(-50%) translateY(0); }
                        40% { transform: translateX(-50%) translateY(-10px); }
                        60% { transform: translateX(-50%) translateY(-5px); }
                      }
                      
                      @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                      }
                      
                      @keyframes fadeInOut {
                        0%, 100% { opacity: 0.7; }
                        50% { opacity: 1; }
                      }
                      
                      @keyframes dotPulse {
                        0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                        40% { transform: scale(1); opacity: 1; }
                      }
                    `}
                  </style>
                </Box>
              )}
              {loadingTrips && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001,
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                      Loading trip data...
                    </Typography>
                  </Box>
                </Box>
              )}
              <Box 
                ref={mapRef}
                className="ol-map" 
                sx={{ 
                  width: "100%", 
                  height: "100%",
                  visibility: showMap ? 'visible' : 'hidden'
                }}>
                {/* Layer Control Panel */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  zIndex: 1000,
                  minWidth: '200px',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Map Layers
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={activeLayers.osm}
                          onChange={() => toggleLayer('osm')}
                          size="small"
                        />
                      }
                      label="OpenStreetMap"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={activeLayers.india3}
                          onChange={() => toggleLayer('india3')}
                          size="small"
                        />
                      }
                      label="India3 Layer"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={activeLayers.indiaBase}
                          onChange={() => toggleLayer('indiaBase')}
                          size="small"
                        />
                      }
                      label="India Base Map"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={activeLayers.indiaRoads}
                          onChange={() => toggleLayer('indiaRoads')}
                          size="small"
                        />
                      }
                      label="India Roads"
                    />
                  </Stack>
                </div>

                <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
                <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
                <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </MainCard>
  );
};

export default TripViewer; 