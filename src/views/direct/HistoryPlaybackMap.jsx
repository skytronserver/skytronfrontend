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
import { TileWMS } from "ol/source";
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
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}api/gps_history_map_data/`,
          {
            params: {
              start_datetime: startDateTime,
              end_datetime: endDateTime,
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
          }),
          new TileLayer({
            source: createBhuvanSource("basemap:admin_group"),
          }),
          new TileLayer({
            source: createBhuvanSource("mmi:mmi_india"),
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
    const coordinates = data.map((entry) => fromLonLat([parseFloat(entry.lon), parseFloat(entry.lat)]));
    const lineFeature = new Feature({
      geometry: new LineString(coordinates),
    });

    // Styling the line between points
    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "blue",
          width: 2,
        }),
      })
    );

    markerRef.current.addFeature(lineFeature);
    allFeaturesRef.current.push(lineFeature); // Store for later

    const extent = markerRef.current.getExtent(); // Get the extent of all markers

    data.forEach((entry, index) => {
      const point = new Feature({
        geometry: new Point(fromLonLat([parseFloat(entry.lon), parseFloat(entry.lat)])),
        data: entry,
      });
      const statusInfo = getStatusInfo(entry);

      // Adding circular marker for each point
      point.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 2,
            fill: new Fill({ color: statusInfo.colorHex }),
          }),
          text: new Text({
            text: (index + 1).toString(),
            scale: 0.2,
            fill: new Fill({ color: statusInfo.colorHex }),
          }),
        })
      );

      markerRef.current.addFeature(point);
      allFeaturesRef.current.push(point); // Store for later
    });

    // Adjust the map to fit all markers after adding them
    map.getView().fit(markerRef.current.getExtent(), {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });

    attachClickToPoints();
    setIsPlaying(false);
    setDownloadStatus("Play");

    // Set initial data for info box and vehicle marker
    if (data.length > 0) {
      setSliderValue(0);
      sliderValueRef.current = 0;
      setCurrentData(data[0]);
      // Initialize the car marker at start position
      updateEmergencyPointer(data[0]);
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
    const { lon, lat, ps, s } = entry;
    // Ensure coordinates are numbers for smooth movement
    const currentCoordinates = fromLonLat([parseFloat(lon), parseFloat(lat)]);

    const statusInfo = getStatusInfo(entry);

    const categoryData = entry?.device_tag_info?.category_info?.category;
    const categoryName = typeof categoryData === 'object' ? categoryData?.category : categoryData;
    const normalizedType = categoryName ? categoryName.toLowerCase().replace(/\s+/g, '_') : 'bus';
    const availableTypes = ['ambulance', 'bus', 'dumper', 'police', 'school_bus', 'tanker', 'taxi', 'truck'];
    const iconType = availableTypes.includes(normalizedType) ? normalizedType : 'bus';

    let iconSrc;
    try {
      iconSrc = require(`../../assets/images/${statusInfo.colorKey}/${iconType}.png`);
    } catch (e) {
      try {
        iconSrc = require(`../../assets/images/${statusInfo.colorKey}/bus.png`);
      } catch (e2) {
        iconSrc = require("../../assets/images/grey/bus.png");
      }
    }

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 0.8], // Bottom center touching the route
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        crossOrigin: 'anonymous',
        src: iconSrc,
        scale: 0.07,
        rotation: 0, // Keep icon straight as requested
      }),
    });

    // Update existing marker or create new one
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

    setCurrentCoordinates(currentCoordinates);
    // Update info box overlay position
    if (infoOverlayRef.current) {
      infoOverlayRef.current.setPosition(currentCoordinates);
      // Force update offset to ensure it sits above the vehicle icon
      // Assuming icon height ~35-40px after scale, -40 puts it at top of icon.
      // We want it higher, so -85 or -100.
      infoOverlayRef.current.setOffset([0, -110]);
    }
    // Optional: Only center if users wants to follow (current behavior: always follows)
    map.getView().setCenter(currentCoordinates);
  };

  const handleSliderChange = (event, value) => {
    setSliderValue(value);
    sliderValueRef.current = value;
    const entry = mapData[value];
    if (entry) {
      updateEmergencyPointer(entry);
    }
  };

  const getStatusInfo = (data) => {
    if (!data) return { colorKey: 'grey', colorHex: '#757575', statusText: 'N/A' };

    const isIgnitionOn = String(data.igs) === "1";
    const speed = Number(data.s || 0);
    const packetStatus = data.ps;

    // Logic based on LiveTracking.jsx
    if (packetStatus === "EA") {
      return { colorKey: 'red', colorHex: '#d32f2f', statusText: 'Emergency' };
    } else if (packetStatus !== "NR" && packetStatus) {
      return { colorKey: 'orange', colorHex: '#ed6c02', statusText: 'Alert' };
    } else if (isIgnitionOn && speed <= 1) {
      return { colorKey: 'blue', colorHex: '#0288d1', statusText: 'Stopped' };
    } else if (isIgnitionOn && speed > 1) {
      return { colorKey: 'green', colorHex: '#2e7d32', statusText: 'Moving' };
    } else {
      return { colorKey: 'grey', colorHex: '#757575', statusText: 'Offline/Ignition Off' };
    }
  };

  const playAnimation = () => {
    setIsPlaying(true);
    // Don't use local variable, use ref
    overlayRef.current.style.display = "none";

    animationIntervalId.current = setInterval(() => {
      if (sliderValueRef.current < maxSliderValue) {
        sliderValueRef.current += 1;
        setSliderValue(sliderValueRef.current);
        const entry = mapData[sliderValueRef.current];
        if (entry) {
          updateEmergencyPointer(entry);
        }
      } else {
        clearInterval(animationIntervalId.current);
        setIsPlaying(false);
      }
    }, (510 - animationSpeed)); // Invert speed: Higher value = Lower delay (Faster)
  };

  const pauseAnimation = () => {
    clearInterval(animationIntervalId.current);
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
      pdf.text(`From: ${startDateTime}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`To: ${endDateTime}`, 20, yPosition);
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
      const dataToShow = mapData.slice(0, 100); // Limit total rows to 100

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

        const rowData = [
          String(index + 1),
          entry.et || 'N/A',
          !isNaN(lat) ? lat.toFixed(6) : 'N/A',
          !isNaN(lon) ? lon.toFixed(6) : 'N/A',
          String(entry.s || 0),
          entry.ps || 'N/A'
        ];

        rowData.forEach((data, idx) => {
          const text = data.length > 20 ? data.substring(0, 17) + '...' : data;
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
      if (mapData.length > 100) {
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'italic');
        pdf.text(`Note: Showing first 100 of ${mapData.length} total data points`, 20, yPosition);
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
  useEffect(() => {
    if (isPlaying) {
      clearInterval(animationIntervalId.current);
      playAnimation();
    }
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
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`} style={{ position: 'absolute', bottom: 0, left: 0, width: '120px', zIndex: 1000 }} />
        <img src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`} style={{ position: 'absolute', top: 0, right: 0, width: '70px', zIndex: 1000 }} />
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
                  <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                    Itg: {String(currentData.igs) === "1" ? "ON" : "OFF"}
                  </Typography>
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