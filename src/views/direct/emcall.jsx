/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Slider,
  Paper,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Map, View } from "ol";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource, TileWMS } from "ol/source";
import { fromLonLat } from "ol/proj";
import { Icon, Style } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import "ol/ol.css";
import HomePageService from "../../services/HomePage";
import "./emcall.css";
import CustomModal from "../../ui-component/CustomModal";
import { useNavigate } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import SettingService from "../../services/SettingService";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { alpha } from '@mui/material/styles';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import MessageIcon from '@mui/icons-material/Message';

const EMCall = () => {
  const { state } = useLocation();
  const { call } = state || {};
  const mapElement = useRef();
  const [broadcastDisabled, setBroadcastDisabled] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [vectorLayer, setVectorLayer] = useState(
    new VectorLayer({ source: new VectorSource() })
  );
  const mapRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Video streaming states
  const [mediaData, setMediaData] = useState({});
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [timeRange, setTimeRange] = useState([0, 100]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  // Add new state for video loading
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // Add new state for video section visibility
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  // Add new state for video URLs
  const [videoUrls, setVideoUrls] = useState({});

  // Add new state for volume and mute
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Add new state for seeking
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);

  // Add new state for current video and video time range
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoStartTime, setVideoStartTime] = useState(0);
  const [videoEndTime, setVideoEndTime] = useState(0);

  // Add new state for unified timeline
  const [allVideosTimeline, setAllVideosTimeline] = useState([]);
  const [timelineStartTime, setTimelineStartTime] = useState(0);
  const [timelineEndTime, setTimelineEndTime] = useState(0);

  // Add new state for video initialization
  const [isInitialized, setIsInitialized] = useState(false);

  // Add new state for stitched video URL
  const [stitchedVideoUrl, setStitchedVideoUrl] = useState(null);
  const mediaSourceRef = useRef(null);
  const sourceBufferRef = useRef(null);

  // Initialize map
  useEffect(() => {
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        // India3 layer
        new TileLayer({
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
          }),
        }),
        // Admin group layer (basemap)
        new TileLayer({
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
          }),
        }),
        // Roads layer (mmi_india)
        new TileLayer({
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
          }),
        }),
        vectorLayer,
      ],

      view: new View({
        center: fromLonLat([91.829437, 26.131644]), // Initial center of the map
        zoom: 7,
      }),

      pixelRatio: 1,
    });

    mapRef.current = map;
    return () => map.setTarget(null); // Cleanup on unmount
  }, []);

  // Fetch locations and plot them on the map
  const fetchAndPlotLocations = async () => {
    try {
      const response = await HomePageService.getEMCallloc({
        assignment_id: call.id,
      });
      const locations = response.data.target || [];

      // Clear previous features
      const source = vectorLayer.getSource();
      source.clear();

      // Add new features
      locations.forEach((location) => {
        console.log(location);
        const { longitude, latitude } = location;
        const coordinates = fromLonLat([longitude, latitude]);
        const feature = new Feature({ geometry: new Point(coordinates) });
        feature.setStyle(
          new Style({
            image: new Icon({
              anchor: [0.5, 1],
              src: `${process.env.REACT_APP_BASE_URL}static/logo/red-skytron-transparent.png`,
              scale: 0.06,
            }),
          })
        );

        source.addFeature(feature);
        //console.log("location updated ");
        //mapRef.current.getView().setCenter(coordinates);
      });
    } catch (error) {
      console.error("Fetch Locations Error:", error);
    }
  };

  // Fetch messages on component mount
  useEffect(() => {
    fetchMessages();
    fetchAndPlotLocations();

    // Set interval to update locations every 30 seconds
    const interval = setInterval(fetchAndPlotLocations, 30000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const handleBroadcast = async (type) => {
    try {
      let broadcastType = type;
      if (type === "both") {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "police_ex",
        });
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type: "ambulance_ex",
        });
        broadcastType = "Police and Ambulance";
      } else {
        await HomePageService.broadCast({
          assignment_id: call.id,
          radius: 5,
          type,
        });
        broadcastType = type === "police_ex" ? "Police" : "Ambulance";
      }

      setBroadcastDisabled(true);
      alert(`${broadcastType} broadcast successful!`);
    } catch (error) {
      console.error("Broadcast Error:", error);
    }
  };

  const handleCloseCall = async () => {
    try {
      // Cleanup video before showing modal
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
        setIsVideoReady(false);
      }
      
      await HomePageService.closeCase({ assignment_id: call.id });
      setModalOpen(true);
    } catch (error) {
      console.error("Close Call Error:", error);
    }
  };

  const handleSendMessage = async () => {
    try {
      await HomePageService.sendEMmessage({
        assignment_id: call.id,
        message: newMessage,
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await HomePageService.getEMmessage({
        assignment_id: call.id,
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Fetch Messages Error:", error);
    }
  };
  const handleModalClose = () => {
    setModalOpen(false);
  };
  const handleRedirectToDashboard = () => {
    navigate('/dashboard');  // Redirect to dashboard
  };

  // Function to create blob URL from video data
  const createVideoUrl = async (mediaLink) => {
    try {
      const response = await SettingService.file_Download({
        file_path: mediaLink
      });
      const blob = new Blob([response.data], { type: 'video/mp4' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error downloading video:", error);
      return null;
    }
  };

  // Modify fetchMediaData to handle video downloads
  const fetchMediaData = async () => {
    try {
      setIsLoadingVideos(true);
      const response = await HomePageService.getEmMedia({
        assignment_id: call.id,
      });
      const media = response.data.media || {};
      
      // Sort videos by timestamp for each camera
      const sortedMedia = {};
      for (const [cameraId, videos] of Object.entries(media)) {
        sortedMedia[cameraId] = videos.sort((a, b) => {
          const timeA = new Date(a.start_time).getTime();
          const timeB = new Date(b.start_time).getTime();
          return timeA - timeB;
        });
      }
      
      setMediaData(sortedMedia);
      
      // Set initial camera if none selected
      if (!selectedCamera && Object.keys(sortedMedia).length > 0) {
        const firstCamera = Object.keys(sortedMedia)[0];
        setSelectedCamera(firstCamera);
      }

      // Download videos for each camera
      const newVideoUrls = {};
      for (const [cameraId, videos] of Object.entries(sortedMedia)) {
        newVideoUrls[cameraId] = await Promise.all(
          videos.map(async (video) => {
            const url = await createVideoUrl(video.media_link);
            return {
              ...video,
              blobUrl: url
            };
          })
        );
      }
      setVideoUrls(newVideoUrls);
      setShowVideoSection(true);
    } catch (error) {
      console.error("Fetch Media Error:", error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(videoUrls).forEach(videos => {
        videos.forEach(video => {
          if (video.blobUrl) {
            URL.revokeObjectURL(video.blobUrl);
          }
        });
      });
    };
  }, [videoUrls]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const videos = mediaData[selectedCamera];
      const total = videos.reduce((acc, video) => acc + video.duration_ms, 0);
      setTotalDuration(total);
      
      if (videos.length > 0) {
        const firstVideo = videos[0];
        const lastVideo = videos[videos.length - 1];
        const startTime = new Date(firstVideo.start_time).getTime();
        const endTime = new Date(lastVideo.end_time).getTime();
        setTimeRange([startTime, endTime]);
      }
    }
  }, [selectedCamera, mediaData]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const videos = mediaData[selectedCamera];
      const sortedVideos = [...videos].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      
      setAllVideosTimeline(sortedVideos);
      
      if (sortedVideos.length > 0) {
        const firstVideo = sortedVideos[0];
        const lastVideo = sortedVideos[sortedVideos.length - 1];
        const startTime = new Date(firstVideo.start_time).getTime();
        const endTime = new Date(lastVideo.end_time).getTime();
        setTimelineStartTime(startTime);
        setTimelineEndTime(endTime);
        setTotalDuration(endTime - startTime);
      }
    }
  }, [selectedCamera, mediaData]);

  const findVideoForTime = (timeMs) => {
    return allVideosTimeline.find((video, index) => {
      const videoStart = new Date(video.start_time).getTime();
      const videoEnd = new Date(video.end_time).getTime();
      return timeMs >= videoStart && timeMs <= videoEnd;
    });
  };

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera] && currentVideoIndex >= 0) {
      const video = mediaData[selectedCamera][currentVideoIndex];
      if (video && videoRef.current) {
        const videoStart = new Date(video.start_time).getTime();
        const currentTimeMs = currentTime;
        const timeInVideo = (currentTimeMs - videoStart) / 1000;
        
        videoRef.current.src = videoUrls[selectedCamera]?.[currentVideoIndex]?.blobUrl;
        videoRef.current.load();
        videoRef.current.currentTime = Math.max(0, timeInVideo);
        
        if (isPlaying) {
          videoRef.current.play().catch(error => {
            console.error("Error playing video:", error);
          });
        }
      }
    }
  }, [currentVideoIndex, selectedCamera]);

  useEffect(() => {
    if (selectedCamera && mediaData[selectedCamera]) {
      createStitchedVideo(mediaData[selectedCamera]);
    }
  }, [selectedCamera, mediaData]);

  const createStitchedVideo = async (videos) => {
    try {
      const mediaSource = new MediaSource();
      mediaSourceRef.current = mediaSource;
      const videoUrl = URL.createObjectURL(mediaSource);
      setStitchedVideoUrl(videoUrl);

      await new Promise((resolve) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
      });
      const sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
      sourceBufferRef.current = sourceBuffer;

      for (const video of videos) {
        const response = await fetch(video.blobUrl);
        const arrayBuffer = await response.arrayBuffer();
        await new Promise((resolve) => {
          sourceBuffer.addEventListener('updateend', resolve, { once: true });
          sourceBuffer.appendBuffer(arrayBuffer);
        });
      }

      mediaSource.endOfStream();
    } catch (error) {
      console.error('Error creating stitched video:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaSourceRef.current) {
        URL.revokeObjectURL(stitchedVideoUrl);
        mediaSourceRef.current = null;
      }
    };
  }, [stitchedVideoUrl]);

  const handleVideoEnded = async () => {
    try {
      setIsPlaying(false);
      
      if (selectedCamera && mediaData[selectedCamera]) {
        const nextIndex = currentVideoIndex + 1;
        if (nextIndex < mediaData[selectedCamera].length) {
          setCurrentVideoIndex(nextIndex);
          const nextVideo = mediaData[selectedCamera][nextIndex];
          
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.removeAttribute('src');
            videoRef.current.load();
            
            videoRef.current.src = nextVideo.blobUrl;
            await videoRef.current.load();
            setIsVideoReady(true);
          }
        } else {
          setCurrentTime(0);
          setIsVideoReady(false);
        }
      }
    } catch (error) {
      console.error("Error handling video end:", error);
    }
  };

  const handleTimeChange = (event, newValue) => {
    if (!videoRef.current || !isVideoReady) return;
    setSeekTime(newValue);
    setIsSeeking(true);
  };

  const handleTimeChangeCommitted = (event, newValue) => {
    if (!videoRef.current || !isVideoReady) return;
    const totalDuration = mediaData[selectedCamera].reduce((acc, video) => acc + video.duration_ms, 0);
    const targetTime = (newValue / totalDuration) * videoRef.current.duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(newValue);
    setIsSeeking(false);
  };

  const handleVideoTimeUpdate = (event) => {
    if (!isSeeking && selectedCamera && mediaData[selectedCamera] && event.target.duration) {
      const currentDuration = event.target.duration || 0;
      const currentTimeInVideo = event.target.currentTime || 0;
      const totalDuration = mediaData[selectedCamera].reduce((acc, video) => acc + (video.duration_ms || 0), 0);
      const currentTimeMs = currentDuration > 0 
        ? (currentTimeInVideo / currentDuration) * totalDuration 
        : 0;
      setCurrentTime(currentTimeMs);
    }
  };

  const calculateTotalDuration = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      return mediaData[selectedCamera].reduce((acc, video) => acc + video.duration_ms, 0);
    }
    return 0;
  };

  const handlePlayPause = async () => {
    if (videoRef.current && isVideoReady) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          const currentVideo = allVideosTimeline[currentVideoIndex];
          if (currentVideo) {
            const videoStart = new Date(currentVideo.start_time).getTime();
            const timeInVideo = (currentTime - videoStart) / 1000;
            videoRef.current.currentTime = Math.max(0, timeInVideo);
          }
          await videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      } catch (error) {
        console.error("Error toggling play state:", error);
      }
    }
  };

  const handleVideoSeeking = () => {
    setIsSeeking(true);
  };

  const handleVideoSeeked = () => {
    setIsSeeking(false);
  };

  const handleVideoLoad = () => {
    setIsVideoLoading(false);
    setIsVideoReady(true);
    setIsInitialized(true);
    
    if (videoRef.current && currentVideo) {
      const videoStart = new Date(currentVideo.start_time).getTime();
      const timeInVideo = (currentTime - videoStart) / 1000;
      videoRef.current.currentTime = Math.max(0, timeInVideo);
    }
  };

  const handleVideoError = () => {
    setIsVideoLoading(false);
    setIsVideoReady(false);
    console.error("Error loading video");
  };

  const handleVideoSelect = async (video, index) => {
    try {
      setIsVideoLoading(true);
      setIsVideoReady(false);
      setCurrentVideoIndex(index);
      setIsPlaying(false);

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
        videoRef.current.src = video.blobUrl;

        // Wait for video to be loaded before playing
        await new Promise((resolve, reject) => {
          const loadHandler = () => {
            setIsVideoReady(true);
            setIsVideoLoading(false);
            resolve();
            // Auto-play the video when selected
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(error => {
              console.error("Error auto-playing video:", error);
            });
          };

          const errorHandler = (error) => {
            setIsVideoLoading(false);
            reject(error);
          };

          videoRef.current.addEventListener('loadeddata', loadHandler, { once: true });
          videoRef.current.addEventListener('error', errorHandler, { once: true });
          videoRef.current.load();
        });
      }
    } catch (error) {
      console.error("Error selecting video:", error);
      setIsVideoLoading(false);
      setIsVideoReady(false);
    }
  };

  const handleVolumeChange = (event, newValue) => {
    const newVolume = newValue / 100;
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(1);
      }
    }
  };

  const handleNextVideo = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const nextIndex = (currentVideoIndex + 1) % mediaData[selectedCamera].length;
      const nextVideo = mediaData[selectedCamera][nextIndex];
      
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentVideoIndex(nextIndex);
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.src = videoUrls[selectedCamera]?.[nextIndex]?.blobUrl;
        videoRef.current.load();
      }
    }
  };

  const handlePreviousVideo = () => {
    if (selectedCamera && mediaData[selectedCamera]) {
      const prevIndex = (currentVideoIndex - 1 + mediaData[selectedCamera].length) % mediaData[selectedCamera].length;
      const prevVideo = mediaData[selectedCamera][prevIndex];
      
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentVideoIndex(prevIndex);
      
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        videoRef.current.src = videoUrls[selectedCamera]?.[prevIndex]?.blobUrl;
        videoRef.current.load();
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const formatTime = (timeInMs) => {
    if (!timeInMs || isNaN(timeInMs)) {
      return "00:00";
    }
    const totalSeconds = Math.floor(Math.max(0, timeInMs) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCameraSelect = (cameraId) => {
    setSelectedCamera(cameraId);
    setCurrentVideoIndex(0); 
    setCurrentTime(0); 
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      const videoContainer = videoRef.current?.parentElement;
      if (videoContainer) {
        videoContainer.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handlePlay = async () => {
        try {
          await videoElement.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Error playing video:", error);
          setIsPlaying(false);
        }
      };

      videoElement.addEventListener('ended', handleVideoEnded);
      videoElement.addEventListener('play', handlePlay);

      return () => {
        videoElement.removeEventListener('ended', handleVideoEnded);
        videoElement.removeEventListener('play', handlePlay);
      };
    }
  }, [selectedCamera, currentVideoIndex]); 

  return (
    <>
      <CustomModal
        open={modalOpen}
        onClose={handleModalClose}
        title="Success"
        content="Call closed successfully!"
        actions={
          <>
            <Button onClick={handleRedirectToDashboard} color="secondary" variant="outlined">
              Done
            </Button>
          </>
        }
      />
      <Box sx={{ 
        p: 3, 
        minHeight: '100vh',
        bgcolor: 'background.default',
        background: 'linear-gradient(145deg, #f5f7fa 0%, #e4e8eb 100%)'
      }}>
        <Grid container spacing={3}>
          {/* Call Details Card */}
          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{
              height: '100%',
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent>
                <Typography variant="h4" sx={{ 
                  mb: 3, 
                  color: 'primary.main',
                  fontWeight: 600,
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1
                }}>
                  CALL DETAILS
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Emergency Call ID</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">IMEI</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.call?.device?.device?.imei || "N/A"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Vehicle RegNo</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>{call?.call?.device?.vehicle_reg_no || "N/A"}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Owner Name</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {call?.call?.device?.vehicle_owner?.users?.[0]?.name || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Call Status</Typography>
                    <Typography variant="body1" sx={{ 
                      fontWeight: 500,
                      color: call?.call?.status === 'active' ? 'success.main' : 'error.main'
                    }}>
                      {call?.call?.status || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              <CardContent>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("police_ex")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Police
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("ambulance_ex")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Ambulance
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBroadcast("both")}
                    disabled={broadcastDisabled}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Broadcast Police & Ambulance
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseCall}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Close Call
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={fetchMediaData}
                    disabled={isLoadingVideos}
                    startIcon={<VideocamIcon />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    {isLoadingVideos ? "Loading Videos..." : "View Videos"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Map Section */}
          <Grid item xs={12} md={9}>
            <Card elevation={3} sx={{
              height: '100%',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div ref={mapElement} className="map-container" style={{ height: '100%', minHeight: '400px' }}>
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/inspace.png`}
                  className="logo-map inspace-logo"
                  alt="img-logo"
                />
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/isro.png`}
                  className="logo-map isro-logo"
                  alt="img-iso"
                />
                <img
                  src={`${process.env.REACT_APP_BASE_URL}static/logo/skytron.png`}
                  className="logo-map skytron-logo"
                  alt="img-skytrack"
                />
              </div>
            </Card>
          </Grid>

          {/* Video Feeds Section */}
          {showVideoSection && (
            <Grid item xs={12}>
              <Card elevation={3} sx={{
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: 'primary.main',
                      fontWeight: 600
                    }}>
                      <VideocamIcon /> Video Feeds
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={fetchMediaData}
                        disabled={isLoadingVideos}
                        startIcon={<VideocamIcon />}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 500
                        }}
                      >
                        Refresh
                      </Button>
                      <IconButton 
                        onClick={toggleFullscreen}
                        sx={{
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          }
                        }}
                      >
                        {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Camera Selection */}
                  <Box mb={3}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                      Select Camera
                    </Typography>
                    <Box display="flex" gap={1} flexWrap="wrap">
                      {Object.keys(mediaData).map((cameraId) => (
                        <Button
                          key={cameraId}
                          variant={selectedCamera === cameraId ? "contained" : "outlined"}
                          onClick={() => handleCameraSelect(cameraId)}
                          startIcon={selectedCamera === cameraId ? <VideocamIcon /> : <VideocamOffIcon />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 500,
                            minWidth: '120px',
                            boxShadow: selectedCamera === cameraId ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            '&:hover': {
                              boxShadow: selectedCamera === cameraId ? '0 6px 16px rgba(0,0,0,0.15)' : 'none',
                            }
                          }}
                        >
                          Camera {cameraId}
                        </Button>
                      ))}
                    </Box>
                  </Box>

                  {/* Video Player */}
                  {selectedCamera && mediaData[selectedCamera] && (
                    <Box mb={4}>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16/9',
                          bgcolor: 'black',
                          borderRadius: 2,
                          overflow: 'hidden',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={() => setShowControls(false)}
                      >
                        {isVideoLoading && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'rgba(0, 0, 0, 0.7)',
                              zIndex: 1,
                            }}
                          >
                            <Typography color="white">Loading video...</Typography>
                          </Box>
                        )}
                        <video
                          ref={videoRef}
                          src={videoUrls[selectedCamera]?.[currentVideoIndex]?.blobUrl}
                          onLoadStart={() => setIsVideoLoading(true)}
                          onLoadedData={handleVideoLoad}
                          onError={handleVideoError}
                          onCanPlay={() => setIsVideoReady(true)}
                          onWaiting={() => setIsVideoReady(false)}
                          onTimeUpdate={handleVideoTimeUpdate}
                          onSeeking={handleVideoSeeking}
                          onSeeked={handleVideoSeeked}
                          onEnded={handleVideoEnded}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                            p: 1.5,
                            opacity: showControls ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out',
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          {/* Progress Bar */}
                          <Box sx={{ mb: 1.5 }}>
                            <Slider
                              value={isSeeking ? seekTime : currentTime}
                              min={0}
                              max={calculateTotalDuration()}
                              onChange={handleTimeChange}
                              onChangeCommitted={handleTimeChangeCommitted}
                              valueLabelDisplay="auto"
                              valueLabelFormat={formatTime}
                              disabled={!isVideoReady || isVideoLoading}
                              sx={{
                                color: 'primary.main',
                                '& .MuiSlider-thumb': {
                                  width: 12,
                                  height: 12,
                                  transition: 'none',
                                },
                                '& .MuiSlider-track': {
                                  transition: 'none',
                                },
                                '& .MuiSlider-rail': {
                                  transition: 'none',
                                },
                              }}
                            />
                          </Box>

                          {/* Controls */}
                          <Box display="flex" alignItems="center" gap={2}>
                            {/* Playback Controls */}
                            <Box display="flex" alignItems="center" gap={1}>
                              <IconButton
                                onClick={handlePreviousVideo}
                                disabled={!isVideoReady || isVideoLoading}
                                color="primary"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  }
                                }}
                              >
                                <SkipPreviousIcon />
                              </IconButton>
                              <IconButton
                                onClick={handlePlayPause}
                                disabled={!isVideoReady || isVideoLoading}
                                color="primary"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  }
                                }}
                              >
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                              </IconButton>
                              <IconButton
                                onClick={handleNextVideo}
                                disabled={!isVideoReady || isVideoLoading}
                                color="primary"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  }
                                }}
                              >
                                <SkipNextIcon />
                              </IconButton>
                            </Box>

                            {/* Time Display */}
                            <Typography variant="body2" color="white" sx={{ 
                              minWidth: '100px',
                              fontFamily: 'monospace',
                              letterSpacing: '0.5px'
                            }}>
                              {formatTime(currentTime)} / {formatTime(calculateTotalDuration())}
                            </Typography>

                            {/* Volume Controls */}
                            <Box display="flex" alignItems="center" gap={1} sx={{ ml: 'auto' }}>
                              <IconButton
                                onClick={handleMuteToggle}
                                color="primary"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                                  }
                                }}
                              >
                                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                              </IconButton>
                              <Slider
                                value={volume * 100}
                                onChange={handleVolumeChange}
                                min={0}
                                max={100}
                                sx={{
                                  width: '100px',
                                  color: 'primary.main',
                                  '& .MuiSlider-thumb': {
                                    width: 12,
                                    height: 12,
                                  },
                                }}
                              />
                            </Box>

                            {/* Fullscreen Toggle */}
                            <IconButton
                              onClick={toggleFullscreen}
                              color="primary"
                              size="small"
                              sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                                }
                              }}
                            >
                              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Video Grid */}
                  <Grid container spacing={2}>
                    {selectedCamera && mediaData[selectedCamera]?.map((video, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                          elevation={3}
                          sx={{
                            p: 2,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            borderRadius: 2,
                            bgcolor: currentVideoIndex === index ? alpha('#1976d2', 0.08) : 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
                            }
                          }}
                          onClick={() => handleVideoSelect(video, index)}
                        >
                          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 500 }}>
                            {new Date(video.start_time).toLocaleString()}
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              bgcolor: 'black',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              aspectRatio: '16/9',
                              overflow: 'hidden',
                            }}
                          >
                            <video
                              src={videoUrls[selectedCamera]?.[index]?.blobUrl}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          </Box>
                          <Box mt={1.5} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTimeIcon sx={{ fontSize: 14 }} />
                              Duration: {formatTime(video.duration_ms)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <WarningIcon sx={{ fontSize: 14 }} />
                              Alert: {video.alert_type}
                            </Typography>
                            {video.message && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <MessageIcon sx={{ fontSize: 14 }} />
                                Message: {video.message}
                              </Typography>
                            )}
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Chat Box */}
          <Grid item xs={12}>
            <Card elevation={3} sx={{
              borderRadius: 2,
              background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 600
                }}>
                  Chat Box
                </Typography>
                <Box className="chat-box" sx={{
                  height: '300px',
                  overflowY: 'auto',
                  mb: 2,
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  {messages.map((msg) => (
                    <Box key={msg.id} className="chat-message" sx={{
                      mb: 1.5,
                      p: 1.5,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="body2" className="chat-username" sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 0.5
                      }}>
                        {msg.assignment.admin.users[0].name}:
                      </Typography>
                      <Typography variant="body2" className="chat-text">
                        {msg.message}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box className="chat-input-container" sx={{
                  display: 'flex',
                  gap: 1
                }}>
                  <TextField
                    fullWidth
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    endIcon={<SendIcon />}
                    onClick={handleSendMessage}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': {
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default EMCall;
