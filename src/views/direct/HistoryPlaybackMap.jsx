import React, { useEffect, useState, useRef } from "react";
import { Box, Button, Slider, Typography, Paper, Grid } from "@mui/material";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopIcon from '@mui/icons-material/Stop';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "ol/ol.css";
import { Map, View } from "ol";
import { Tile as TileLayer } from "ol/layer";
import { TileWMS, XYZ } from "ol/source";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Icon, Style, Stroke, Circle as CircleStyle, Fill, Text } from "ol/style";
import Point from "ol/geom/Point";
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import { getCenter } from "ol/extent"; // For centering the map
import axios from "axios";
import Select from "ol/interaction/Select";
import { formatDateTime } from "../../helper";

const GPSHistoryMap = ({
  startDateTime,
  endDateTime,
  vehicleRegistrationNumber,
  downloadStatus,
  setDownloadStatus,
  poi,
  owner,
  roads,
  polygon,
}) => {
  const [map, setMap] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [maxSliderValue, setMaxSliderValue] = useState(0);
  const [streetLevelZoom, setStreetLevelZoom] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(200);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const mapRef = useRef(null);
  const overlayRef = useRef(null);
  const markerRef = useRef(null);
  const animationMarkerRef = useRef(null); // Separate ref for the animation marker
  const animationIntervalId = useRef(null);

  const featureOverlayRef = useRef(null);
  const infoOverlayRef = useRef(null); // Ref for live info box overlay
  const infoBoxElementRef = useRef(null); // Ref for the DOM element of info box
  const allFeaturesRef = useRef([]); // To store all features and avoid clearing markers

  const isRecordingRef = useRef(false); // Ref to track recording state for render loop
  const sliderValueRef = useRef(0); // Ref to track slider value for animation loop

  const STREET_ZOOM_LEVEL = 18;

  const isPlayingRef = useRef(false);
  const animationSpeedRef = useRef(animationSpeed);

  function getStatusInfo(data) {
    if (!data) return { colorKey: 'grey', colorHex: '#757575', statusText: 'N/A' };

    const isIgnitionOn = String(data.igs) === "1";
    const speed = Number(data.s || 0);
    const packetStatus = data.ps;

    if (packetStatus === "EA") {
      return { colorKey: 'red', colorHex: '#d32f2f', statusText: 'Emergency' };
    } else if (packetStatus !== "NR" && packetStatus) {
      return { colorKey: 'orange', colorHex: '#ed6c02', statusText: 'Alert' };
    } else if (speed > 0) {
      return { colorKey: 'green', colorHex: '#2e7d32', statusText: 'Moving' };
    } else if (isIgnitionOn) {
      return { colorKey: 'blue', colorHex: '#0288d1', statusText: 'Stopped' };
    } else {
      return { colorKey: 'grey', colorHex: '#757575', statusText: 'Offline/Ignition Off' };
    }
  }

  const interpolate = (start, end, t) => {
  return start + (end - start) * t;
};

  const getSmoothedCoordinate = (data, index) => {
  let sumLat = 0;
  let sumLon = 0;
  let count = 0;

  const usedPoints = [];

  for (let i = index - 2; i <= index + 2; i++) {
    if (data[i]) {
      const lat = parseFloat(data[i].lat);
      const lon = parseFloat(data[i].lon);

      sumLat += lat;
      sumLon += lon;
      count++;

      usedPoints.push({ lat, lon });
    }
  }

  const avg = {
    lat: sumLat / count,
    lon: sumLon / count,
  };

  console.log(" INDEX:", index);
  console.log(" USED POINTS:", usedPoints);
  console.log(" AVERAGE:", avg);

  return avg;
};

function playAnimation() {
  isPlayingRef.current = true;
  setIsPlaying(true);
  overlayRef.current.style.display = "none";

  let lastTime = performance.now();

  function animate(time) {
    if (!isPlayingRef.current) return;

    const delta = time - lastTime;
    lastTime = time;

    const speedFactor = Math.max(animationSpeedRef.current / 100, 0.2);
    sliderValueRef.current += delta * 0.001 * speedFactor;

    const baseIndex = Math.floor(sliderValueRef.current);
    const nextIndex = baseIndex + 1;

    //  HARD SAFETY CHECK (MOST IMPORTANT FIX)
    if (
      baseIndex >= mapData.length - 1 ||
      nextIndex >= mapData.length ||
      !mapData[baseIndex] ||
      !mapData[nextIndex]
    ) {
      isPlayingRef.current = false;
      setIsPlaying(false);
      return;
    }

    const currData = mapData[baseIndex];
    const nextData = mapData[nextIndex];

    const currTime = new Date(currData.et).getTime();
    const nextTime = new Date(nextData.et).getTime();

    // EXTRA SAFETY (in case et missing)
    if (!currData.et || !nextData.et) {
      sliderValueRef.current = nextIndex;
      setSliderValue(nextIndex);
      requestAnimationFrame(animate);
      return;
    }

    const diffMinutes = (nextTime - currTime) / (1000 * 60);

    // OFFLINE → DIRECT JUMP
    if (diffMinutes > 5) {
      sliderValueRef.current = nextIndex;
      setSliderValue(nextIndex);

      updateEmergencyPointer(nextData);

      requestAnimationFrame(animate);
      return;
    }

    const t = sliderValueRef.current - baseIndex;

    // STAY ON LINE
    const current = {
      lat: parseFloat(currData.lat),
      lon: parseFloat(currData.lon),
    };

    const next = {
      lat: parseFloat(nextData.lat),
      lon: parseFloat(nextData.lon),
    };

    const lat = interpolate(current.lat, next.lat, t);
    const lon = interpolate(current.lon, next.lon, t);

    const fakeEntry = {
      ...currData,
      lat,
      lon,
    };

    setSliderValue(baseIndex);
    updateEmergencyPointer(fakeEntry);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

  const redM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/red/bus.png"),
      scale: 0.07,
    }),
  });
  const orangeM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/orange/bus.png"),
      scale: 0.07,
    }),
  });

  const blueM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/blue/bus.png"),
      scale: 0.07,
    }),
  });

  const greenM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/green/bus.png"),
      scale: 0.07,
    }),
  });

  const greyM = new Style({
    image: new Icon({
      anchor: [0.5, 1],
      crossOrigin: 'anonymous',
      src: require("../../assets/images/grey/bus.png"),
      scale: 0.07,
    }),
  });

  // Fetch map data from the API
  const fetchMapData = async () => {
    setIsPlaying(false);
    setDownloadStatus("Idle");
    try {
      if (vehicleRegistrationNumber !== "") {
        // Stop any existing animation
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
        setDownloadStatus("Downloading");

        // Convert IST filter input to UTC before sending
        function istToUTCString(dt) {
          const dateObj = new Date(dt);
          // Subtract IST offset
          const utc = dateObj.getTime() - (5.5 * 60 * 60000);
          const utcDate = new Date(utc);
          const y = utcDate.getFullYear();
          const m = String(utcDate.getMonth() + 1).padStart(2, '0');
          const d = String(utcDate.getDate()).padStart(2, '0');
          const h = String(utcDate.getHours()).padStart(2, '0');
          const min = String(utcDate.getMinutes()).padStart(2, '0');
          const s = String(utcDate.getSeconds()).padStart(2, '0');
          return `${y}-${m}-${d}T${h}:${min}:${s}Z`;
        }

        // Send times as-is (assumed already IST from UI)
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}api/gps_history_map_data/`,
          {
            params: {
              start_datetime: istToUTCString(startDateTime),
              end_datetime: istToUTCString(endDateTime),
              vehicle_registration_number: vehicleRegistrationNumber,
              poi: poi,
              vehicle_owner: owner,
              roads: roads,
              polygon: polygon,
            },
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${sessionStorage.getItem("oAuthToken")}`,
            },
          }
        );

        const data = response.data.data;
        setDownloadStatus("Processing");
        setMapData(data);
        setMaxSliderValue(data.length - 1);
      }
    } catch (error) {
      console.error("Error fetching map data:", error);
    }
  };

  useEffect(() => {
    fetchMapData(); // Fetch data on prop changes
  }, [startDateTime, endDateTime, vehicleRegistrationNumber, poi, owner, roads, polygon]);

  useEffect(() => {
    if (!map) {
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
        const bhuvanUrl = resolveBhuvanWmsUrl();
        const opts = {
          url: bhuvanUrl,
          params: {
            'LAYERS': layerName,
            'STYLES': "",
            'TILED': true,
            'VERSION': '1.1.1',
            'FORMAT': 'image/png',
            'TRANSPARENT': 'true',
            'SRS': 'EPSG:4326',
            'WIDTH': 256,
            'HEIGHT': 256,
          },
          serverType: 'geoserver',
          projection: 'EPSG:4326',
          transition: 0,
        };

        // Note: Bhuvan servers often reject CORS requests, so we default to no crossOrigin.
        // This restores map visibility but may prevent direct video recording of the map tiles.
        if (process.env.REACT_APP_BHUVAN_ENABLE_CORS === "true") {
          opts.crossOrigin = "anonymous";
        }

        console.log(`[Bhuvan] Creating layer: ${layerName} with URL: ${opts.url}`);

        const source = new TileWMS(opts);

        source.on('tileloadstart', () => {
          // console.log(`[Bhuvan] Tile load start for ${layerName}`);
        });

        source.on('tileloadend', () => {
          // console.log(`[Bhuvan] Tile load success for ${layerName}`);
        });

        source.on('tileloaderror', (event) => {
          console.error(`[Bhuvan] Tile load ERROR for ${layerName}`, event);
        });

        return source;
      };

      // Debug container
      if (mapRef.current) {
        console.log(`[Map] Container Size: ${mapRef.current.clientWidth}x${mapRef.current.clientHeight}`);
      }

      const initialMap = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: createBhuvanSource("india3"),
            zIndex: 1,
          }),
          new TileLayer({
            source: createBhuvanSource("basemap:admin_group"),
            zIndex: 4,
          }),
          new TileLayer({
            source: new XYZ({
              url: "https://map2.gromed.in/tile/{z}/{x}/{y}.png",
              attributions: '© OpenStreetMap contributors',
              maxZoom: 20,
              projection: "EPSG:3857"
            }),
            zIndex: 3,
            minZoom: 11,
          }),
        ],
        view: new View({
          center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
          zoom: 7,
        }),
        pixelRatio: 1,
      });

      const overlay = new Overlay({
        element: overlayRef.current,
        autoPan: true,
        autoPanAnimation: {
          duration: 250,
        },
      });
      initialMap.addOverlay(overlay);

      // Create overlay for moving info box
      const infoOverlay = new Overlay({
        element: infoBoxElementRef.current,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -85], // Position above the icon (increased offset for new anchor)
      });
      initialMap.addOverlay(infoOverlay);
      infoOverlayRef.current = infoOverlay;

      const markerSource = new VectorSource();
      const markerLayer = new VectorLayer({
        source: markerSource,
        zIndex: 100, // Ensure markers are above tile layers
      });

      initialMap.addLayer(markerLayer);

      setMap(initialMap);
      markerRef.current = markerSource;
      featureOverlayRef.current = overlay;
    }
  }, [map]);

  const zoomIn = () => {
    map.getView().setZoom(map.getView().getZoom() + 1);
  };

  const zoomOut = () => {
    map.getView().setZoom(map.getView().getZoom() - 1);
  };

  const panTo = (lon, lat) => {
    map.getView().setCenter(fromLonLat([lon, lat]));
  };

  // Function to add markers and lines when data is loaded
  const loadMarkersAndLines = (data) => {
  if (!data || data.length < 2) return;

  markerRef.current.clear();
  allFeaturesRef.current = [];

  let isOfflineBreak = false; // TRACK BREAK

  for (let i = 0; i < data.length - 1; i++) {
    const curr = data[i];
    const next = data[i + 1];

    const currCoord = fromLonLat([
      parseFloat(curr.lon),
      parseFloat(curr.lat),
    ]);

    const nextCoord = fromLonLat([
      parseFloat(next.lon),
      parseFloat(next.lat),
    ]);

    const currTime = new Date(curr.et).getTime();
    const nextTime = new Date(next.et).getTime();
    const diffMinutes = (nextTime - currTime) / (1000 * 60);

    // OFFLINE DETECTED
    if (diffMinutes > 5) {
      isOfflineBreak = true;

      const offlineStyle = new Style({
        image: new CircleStyle({
          radius: 4,
          fill: new Fill({ color: "#9e9e9e" }),
        }),
      });

      const startPoint = new Feature({
        geometry: new Point(currCoord),
      });
      startPoint.setStyle(offlineStyle);

      const endPoint = new Feature({
        geometry: new Point(nextCoord),
      });
      endPoint.setStyle(offlineStyle);

      markerRef.current.addFeature(startPoint);
      markerRef.current.addFeature(endPoint);

      allFeaturesRef.current.push(startPoint, endPoint);

      continue; // STOP LINE
    }

    // IMPORTANT: SKIP FIRST LINE AFTER OFFLINE
    if (isOfflineBreak) {
      isOfflineBreak = false;
      continue;
    }

    // NORMAL LINE
    const statusInfo = getStatusInfo(curr);

    const segment = new Feature({
      geometry: new LineString([currCoord, nextCoord]),
    });

    segment.setStyle(
      new Style({
        stroke: new Stroke({
          color: statusInfo.colorHex,
          width: 3,
        }),
      })
    );

    markerRef.current.addFeature(segment);
    allFeaturesRef.current.push(segment);
  }

  // POINTS (no extra offline clutter)
  data.forEach((entry, index) => {
    const prev = data[index - 1];

    if (prev) {
      const diffMinutes =
        (new Date(entry.et) - new Date(prev.et)) / (1000 * 60);

      if (diffMinutes > 5) return;
    }

    const point = new Feature({
      geometry: new Point(
        fromLonLat([parseFloat(entry.lon), parseFloat(entry.lat)])
      ),
      data: entry,
    });

    const statusInfo = getStatusInfo(entry);

    point.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({ color: statusInfo.colorHex }),
        }),
      })
    );

    markerRef.current.addFeature(point);
    allFeaturesRef.current.push(point);
  });

  attachClickToPoints();

  setIsPlaying(false);
  setDownloadStatus("Play");

  if (data.length > 0) {
    setSliderValue(0);
    sliderValueRef.current = 0;
    setCurrentData(data[0]);
    updateEmergencyPointer(data[0]);

    const first = data[0];
    const center = fromLonLat([
      parseFloat(first.lon),
      parseFloat(first.lat),
    ]);

    map.getView().animate({
      center,
      zoom: 15,
      duration: 1000,
    });
  }
};

  // Attach click event to each point feature
  const attachClickToPoints = () => {
    const select = new Select(); // Create a select interaction
    map.addInteraction(select);

    select.on("select", function (event) {
      const selectedFeatures = event.selected;
      selectedFeatures.forEach((feature) => {
        const data = feature.get("data");
        if (data) {
          displayLocationData(feature.get("data"), fromLonLat([data.lon, data.lat]));
        }
      });
    });
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
      console.log(data);
      document.getElementById("overlay-content").innerHTML = content;

      // Set overlay position and make it visible
      featureOverlayRef.current.setPosition(coordinates);
      overlayRef.current.style.display = "block";
    }
  };

 const updateEmergencyPointer = (entry) => {
  if (!entry) return;

  setCurrentData(entry);

  const currentCoordinates = fromLonLat([
    parseFloat(entry.lon),
    parseFloat(entry.lat),
  ]);

  const statusInfo = getStatusInfo(entry);

  const categoryData = entry?.device_tag_info?.category_info?.category;
  const categoryName =
    typeof categoryData === "object"
      ? categoryData?.category
      : categoryData;

  const normalizedType = categoryName
    ? categoryName.toLowerCase().replace(/\s+/g, "_")
    : "bus";

  const availableTypes = [
    "ambulance",
    "bus",
    "dumper",
    "police",
    "school_bus",
    "tanker",
    "taxi",
    "truck",
  ];

  const iconType = availableTypes.includes(normalizedType)
    ? normalizedType
    : "bus";

  let iconSrc;
  try {
    iconSrc = require(`../../assets/images/${statusInfo.colorKey}/${iconType}.png`);
  } catch {
    iconSrc = require(`../../assets/images/${statusInfo.colorKey}/bus.png`);
  }

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 0.8],
      src: iconSrc,
      scale: 0.07,
    }),
  });

  // MOVE MARKER
  if (animationMarkerRef.current) {
    animationMarkerRef.current.getGeometry().setCoordinates(currentCoordinates);
    animationMarkerRef.current.setStyle(iconStyle);
  } else {
    const marker = new Feature({
      geometry: new Point(currentCoordinates),
    });
    marker.setStyle(iconStyle);
    markerRef.current.addFeature(marker);
    animationMarkerRef.current = marker;
  }

  // MOVE INFO BOX
  if (infoOverlayRef.current) {
    infoOverlayRef.current.setPosition(currentCoordinates);
    infoOverlayRef.current.setOffset([0, -110]);
  }

  // FIX: PERFECT SYNC MAP MOVEMENT
  if (map) {
    map.getView().setCenter(currentCoordinates);
  }
};

  const handleSliderChange = (event, value) => {
  setSliderValue(value);
  sliderValueRef.current = value;

  const curr = mapData[value];
  const prev = mapData[value - 1];

  if (prev) {
    const diffMinutes =
      (new Date(curr.et) - new Date(prev.et)) / (1000 * 60);

    // OFFLINE → DIRECT POSITION
    if (diffMinutes > 5) {
      updateEmergencyPointer(curr);
      return;
    }
  }

  // USE ORIGINAL COORDINATES (no smoothing drift)
  updateEmergencyPointer(curr);
};

 const pauseAnimation = () => {
  isPlayingRef.current = false; // IMPORTANT
  setIsPlaying(false);
};

  const restartAnimation = () => {
    setSliderValue(0);
    sliderValueRef.current = 0;
    if (mapData[0]) updateEmergencyPointer(mapData[0]);
  };

  // Video recording functions
  const getSupportedMimeType = () => {
    // Prioritize MP4 (H.264) for better compatibility with media players
    const types = [
      'video/webm;codecs=vp9', // High quality, reliable
      'video/webm;codecs=vp8', // Standard reliable fallback
      'video/webm',            // Generic WebM
      'video/mp4;codecs=h264', // Chrome/Edge/Safari (Can be buggy)
      'video/mp4;codecs=avc1', // Alternative H.264 identifier
      'video/mp4',             // Generic MP4
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const getFileExtension = (mimeType) => {
    if (mimeType && mimeType.includes('mp4')) return 'mp4';
    return 'webm';
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert("Screen recording is not supported in this browser. Please use a modern browser like Chrome, Edge, or Firefox.");
        return;
      }

      // Prompt user to select the tab to record
      // Ideally they should select "This Tab" for the best experience.
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "browser",
        },
        audio: false,
        preferCurrentTab: true,
      });

      const mimeType = getSupportedMimeType();
      console.log('Starting recording with format:', mimeType);

      const recorder = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 8000000 // 8 Mbps for higher quality
      });

      const chunks = [];
      const recordedMimeType = mimeType;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        // Stop all tracks to release the screen/tab capture
        stream.getTracks().forEach(track => track.stop());

        if (chunks.length === 0) {
          console.warn("No video data recorded.");
          // This might happen if user stops immediately or cancels
          // alert("Recording failed: No video data was captured.");
          setRecordedChunks([]);
          return;
        }

        const blob = new Blob(chunks, { type: recordedMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const extension = getFileExtension(recordedMimeType);
        a.style.display = 'none';
        a.href = url;
        a.download = `history-playback-${vehicleRegistrationNumber}-${new Date().getTime()}.${extension}`;
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);

        setRecordedChunks([]);
      };

      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        alert('An error occurred during recording.');
        setIsRecording(false);
        setMediaRecorder(null);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Auto-start playback if not already playing
      if (!isPlaying) {
        playAnimation();
      }

      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
      // Don't alert if user cancelled (NotAllowedError is common when user clicks Cancel)
      if (error.name !== 'NotAllowedError') {
        alert(`Failed to start recording: ${error.message}`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);

      // Stop playback when recording stops
      if (isPlaying) {
        pauseAnimation();
      }
    }
  };

  // PDF Export Function
  const exportToPdf = async () => {
    if (!mapRef.current || mapData.length === 0) {
      alert('No data available to export. Please load GPS data first.');
      return;
    }

    setIsExportingPdf(true);

    try {
      // Create PDF with landscape orientation for better map view
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Add Title
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('GPS History Playback Report', pageWidth / 2, yPosition, { align: 'center' });

      yPosition += 10;

      // Add Vehicle Information
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Vehicle: ${vehicleRegistrationNumber}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`From: ${formatDateTime(startDateTime).replace(/\n/g, ' ')}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`To: ${formatDateTime(endDateTime).replace(/\n/g, ' ')}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Total Points: ${mapData.length}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 20, yPosition);
      yPosition += 12;

      // Capture the map image using Screen Capture API to bypass CORS issues
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
          alert("To export the map with the route, please use a modern browser (Chrome/Edge/Firefox) that supports screen capture.");
          throw new Error("Screen capture not supported");
        }

        // Alert the user to select the current tab
        alert("Please select 'This Tab' (or 'Current Tab') in the sharing prompt to capture the map for the PDF.");

        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: "browser" },
          audio: false,
          preferCurrentTab: true,
        });

        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        // Wait a moment for the video to stabilize
        await new Promise(r => setTimeout(r, 500));

        const width = video.videoWidth;
        const height = video.videoHeight;
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, width, height);

        // Stop the stream
        stream.getTracks().forEach(track => track.stop());

        // Crop the image to the map area
        let finalCanvas = canvas;
        if (mapRef.current) {
          const rect = mapRef.current.getBoundingClientRect();
          // Calculate scale in case the video resolution differs from window resolution (e.g. retina)
          const scaleX = width / window.innerWidth;
          const scaleY = height / window.innerHeight;

          // Note: Screen capture captures the visible viewport. 
          // getBoundingClientRect is relative to viewport.
          // We apply the scale factor.

          // Ensure we don't crop outside bounds
          const cropX = Math.max(0, rect.left * scaleX);
          const cropY = Math.max(0, rect.top * scaleY);
          const cropWidth = Math.min(width - cropX, rect.width * scaleX);
          const cropHeight = Math.min(height - cropY, rect.height * scaleY);

          if (cropWidth > 0 && cropHeight > 0) {
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = cropWidth;
            croppedCanvas.height = cropHeight;
            const croppedCtx = croppedCanvas.getContext("2d");
            croppedCtx.drawImage(canvas, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
            finalCanvas = croppedCanvas;
          }
        }

        const imgData = finalCanvas.toDataURL('image/jpeg', 0.8);
        const imgWidth = pageWidth - 40;
        const imgHeight = (finalCanvas.height * imgWidth) / finalCanvas.width;

        // Check if we need a new page for the map
        if (yPosition + imgHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.addImage(imgData, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;

      } catch (error) {
        console.error('Error capturing map:', error);
        pdf.text('Map image could not be captured (Screen capture cancelled or failed).', 20, yPosition);
        yPosition += 10;
      }

      // Add new page for route data table
      pdf.addPage();
      yPosition = 20;

      // Route Data Table
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Route Details', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont(undefined, 'bold');
      const headers = ['#', 'Date/Time', 'Latitude', 'Longitude', 'Speed (km/h)', 'Status'];
      const colWidths = [15, 60, 35, 35, 30, 30];
      let xPosition = 20;

      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });

      yPosition += 7;
      pdf.setFont(undefined, 'normal');

      // Table data (limited to prevent overflow)
      const maxRows = 30; // Limit rows per page
      const dataToShow = mapData.slice(0, 1000); // Limit total rows to 1000

      dataToShow.forEach((entry, index) => {
        if (index > 0 && index % maxRows === 0) {
          pdf.addPage();
          yPosition = 20;

          // Reprint headers on new page
          pdf.setFont(undefined, 'bold');
          xPosition = 20;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[idx];
          });
          yPosition += 7;
          pdf.setFont(undefined, 'normal');
        }

        xPosition = 20;
        const lat = parseFloat(entry.lat);
        const lon = parseFloat(entry.lon);

        const dateTimeForPdf = formatDateTime(entry.et)
          .replace(/\n/g, ' ')
          .replace(/\s*IST\s*$/, '');

        const rowData = [
          String(index + 1),
          dateTimeForPdf,
          !isNaN(lat) ? lat.toFixed(6) : 'N/A',
          !isNaN(lon) ? lon.toFixed(6) : 'N/A',
          String(entry.s || 0),
          entry.ps || 'N/A'
        ];

        rowData.forEach((data, idx) => {
          const isDateTimeColumn = idx === 1;
          const text = !isDateTimeColumn && data.length > 20 ? data.substring(0, 17) + '...' : data;
          pdf.text(text, xPosition, yPosition);
          xPosition += colWidths[idx];
        });

        yPosition += 6;

        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;

          // Reprint headers
          pdf.setFont(undefined, 'bold');
          xPosition = 20;
          headers.forEach((header, idx) => {
            pdf.text(header, xPosition, yPosition);
            xPosition += colWidths[idx];
          });
          yPosition += 7;
          pdf.setFont(undefined, 'normal');
        }
      });

      // Add note if data was truncated
      if (mapData.length > 1000) {
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Note: Showing first 1000 of ${mapData.length} total data points`, 20, yPosition);
      } else if (mapData.length > 0) {
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Note: Showing all ${mapData.length} data points`, 20, yPosition);
      }

      // Save the PDF
      pdf.save(`history-playback-${vehicleRegistrationNumber}-${new Date().getTime()}.pdf`);

      alert('PDF exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Auto-stop recording when playback completes
  useEffect(() => {
    if (isRecording && !isPlaying && sliderValue === maxSliderValue) {
      stopRecording();
    }
  }, [isPlaying, isRecording, sliderValue, maxSliderValue]);

  // Handle speed change dynamically
  // useEffect(() => {
  //   if (isPlaying) {
  //     clearInterval(animationIntervalId.current);
  //     playAnimation();
  //   }
  // }, [animationSpeed]);

  useEffect(() => {
  animationSpeedRef.current = animationSpeed;
}, [animationSpeed]);

  useEffect(() => {
    if (mapData.length > 0 && markerRef.current) {
      loadMarkersAndLines(mapData);
    }
  }, [mapData]);

  return (
    <Box>
      <Typography
        variant="caption"
        style={{ textAlign: "left", verticalAlign: "top", fontSize: "10px" }}
      >
        {downloadStatus}
      </Typography>


      <Box
        id="controls-container"
        sx={{
          mt: 2,
          visibility: mapData.length ? "visible" : "hidden",
          display: "flex",
          alignItems: "left",
          width: "100%",
        }}
      >
        <Slider
          id="time-slider"
          min={0}
          max={maxSliderValue}
          value={sliderValue}
          onChange={handleSliderChange}
          sx={{
            width: "70%", mr: 2,
            alignItems: "left",
          }}
        />
        <Button onClick={isPlaying ? pauseAnimation : playAnimation} sx={{ ml: 2, alignItems: "left", }}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button onClick={restartAnimation} sx={{ ml: 2, alignItems: "left", }}>
          Restart
        </Button>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "contained" : "outlined"}
          color={isRecording ? "error" : "primary"}
          startIcon={isRecording ? <StopIcon /> : <FiberManualRecordIcon />}
          sx={{ ml: 2, alignItems: "left", }}
          disabled={isExportingPdf}
        >
          {isRecording ? "Stop Recording" : "Export as Video"}
        </Button>
        <Button
          onClick={exportToPdf}
          variant="outlined"
          color="success"
          startIcon={<PictureAsPdfIcon />}
          sx={{ ml: 2, alignItems: "left", }}
          disabled={isRecording || isExportingPdf}
        >
          {isExportingPdf ? "Generating PDF..." : "Export as PDF"}
        </Button>
        <Typography variant="body2" sx={{ ml: 2, alignItems: "right", }}>Slower</Typography>
        <Slider
          value={animationSpeed}
          onChange={(e, value) => setAnimationSpeed(value)}
          min={10}
          max={500}
          step={10}
          sx={{ width: "10%", ml: 2, alignItems: "right", }}
        />
        <Typography sx={{ ml: 2, alignItems: "right", }} variant="body2">Faster</Typography>

      </Box>



      <Box ref={mapRef} sx={{ width: "100%", height: "600px", position: 'relative' }}>
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`} style={{ position: 'absolute', bottom: "20px", right: 0, width: '200px', zIndex: 1000, backgroundColor: 'transparent' }} />

        {/* Hidden Container for Overlay Content - React Renders Here, OL uses DOM element */}
        <div ref={infoBoxElementRef} style={{ position: 'absolute', minWidth: '150px', top: '-17px', left: '50%', transform: 'translateX(-50%)' }}>
          {currentData && (
            <Paper
              elevation={2}
              sx={{
                p: 0.5,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderTop: `2px solid ${getStatusInfo(currentData).colorHex}`,
                borderRadius: 1,
                minWidth: 'auto',
                maxWidth: 180 // Increased slightly to fit date/loc
              }}
            >
              <Grid container spacing={0.25}>
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" gap={0.5}>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                      {vehicleRegistrationNumber}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: getStatusInfo(currentData).colorHex,
                        color: 'white',
                        px: 0.5,
                        borderRadius: 0.5,
                        fontSize: '0.6rem',
                        lineHeight: 1
                      }}
                    >
                      {getStatusInfo(currentData).statusText}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    {String(currentData.s)} km/h
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ textAlign: 'right' }}>
                  {String(currentData.igs) === "1" && (
                    <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                      Itg: ON
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', lineHeight: 1.1 }}>
                    {/* Show full formatted date time */}
                    {formatDateTime(currentData.et)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', display: 'block', lineHeight: 1.1 }}>
                    Loc: {Number(currentData.lat).toFixed(4)}, {Number(currentData.lon).toFixed(4)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </div>
      </Box>
      <Box
        ref={overlayRef}
        className="dynamic-overlay"
        style={{
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          border: "1px solid #ccc",
          display: "none", // Initially hidden
        }}
      >
        <p id="overlay-content"></p>
      </Box>
    </Box>
  );
};

export default GPSHistoryMap;