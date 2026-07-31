/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, IconButton, Chip, useTheme, useMediaQuery, Modal } from '@mui/material';
import { MapContainer } from '../components/Map/MapContainer';
import { styled } from '@mui/material/styles';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const VideoFeedContainer = styled(Paper)(({ theme, isFullscreen }) => ({
  padding: theme.spacing(1.5),
  height: isFullscreen ? '90vh' : '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.shape.borderRadius * 2,
  transition: 'all 0.2s ease',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
  border: `1px solid ${theme.palette.divider}`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  backgroundColor: status === 'active' ? theme.palette.success.main : theme.palette.error.main,
  color: theme.palette.common.white,
}));

const dummyVideoFeeds = [
  { 
    id: 1, 
    name: 'Camera 1', 
    location: { lat: 12.9716, lng: 77.5946 },
    status: 'active',
    type: 'PTZ Camera'
  },
  { 
    id: 2, 
    name: 'Camera 2', 
    location: { lat: 12.9796, lng: 77.5902 },
    status: 'inactive',
    type: 'Fixed Camera'
  },
  { 
    id: 3, 
    name: 'Camera 3', 
    location: { lat: 12.9716, lng: 77.6088 },
    status: 'active',
    type: 'Dome Camera'
  },
  { 
    id: 4, 
    name: 'Camera 4', 
    location: { lat: 12.9726, lng: 77.6098 },
    status: 'active',
    type: 'PTZ Camera'
  },
];

const CameraFeedsView = () => {
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [trackingData, setTrackingData] = useState([]);
  const [fullscreenFeed, setFullscreenFeed] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [selectedCameraForCapture, setSelectedCameraForCapture] = useState(null);
  const [mainFeed, setMainFeed] = useState(dummyVideoFeeds[0]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Simulate real-time tracking updates
    const interval = setInterval(() => {
      const newTrackingData = dummyVideoFeeds.map(camera => ({
        ...camera,
        location: {
          lat: camera.location.lat + (Math.random() - 0.5) * 0.001,
          lng: camera.location.lng + (Math.random() - 0.5) * 0.001,
        }
      }));
      setTrackingData(newTrackingData);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const toggleFullscreen = (feedId) => {
    setFullscreenFeed(fullscreenFeed === feedId ? null : feedId);
  };

  const openCameraModal = (feed, e) => {
    e.stopPropagation();
    setSelectedCameraForCapture(feed);
    setIsCameraModalOpen(true);
  };

  const handleCapture = () => {
    if (!selectedCameraForCapture) return;
    
    const timestamp = new Date().toISOString();
    const newCapture = {
      id: `${selectedCameraForCapture.id}-${timestamp}`,
      cameraName: selectedCameraForCapture.name,
      timestamp: timestamp,
      location: selectedCameraForCapture.location,
      type: selectedCameraForCapture.type,
      imageUrl: '/path/to/captured/image.jpg'
    };
    
    setCapturedImages(prev => [...prev, newCapture]);
    setIsCameraModalOpen(false);
    alert(`Image captured from ${selectedCameraForCapture.name}\nLocation: ${selectedCameraForCapture.location.lat}, ${selectedCameraForCapture.location.lng}`);
  };

  // Helper function to determine grid size based on number of feeds
  const getGridSize = (totalFeeds) => {
    if (totalFeeds === 1) return 12;
    if (totalFeeds === 2) return 6;
    return 6; // Always show 2 cameras per row for better visibility
  };

  return (
    <Box sx={{ 
      height: '100vh',
      p: { xs: 1, sm: 2, md: 3 },
      backgroundColor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <Typography variant="h5" gutterBottom sx={{ 
        mb: { xs: 1, sm: 2 },
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        color: theme.palette.text.primary,
        fontWeight: 500,
      }}>
        <VideocamIcon sx={{ fontSize: '1.2em' }} /> Live Feeds
      </Typography>
      
      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }} sx={{ flex: 1, overflow: 'auto' }}>
        <Grid item xs={12} md={fullscreenFeed ? 12 : 8} sx={{ height: { xs: 'auto', md: '100%' } }}>
          {/* Main Video Feed */}
          <VideoFeedContainer
            isFullscreen={false}
            sx={{ 
              height: { xs: '40vh', md: '60%' },
              mb: { xs: 1, sm: 2 },
              cursor: 'pointer',
              opacity: mainFeed.status === 'inactive' ? 0.7 : 1,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2 
            }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {mainFeed.status === 'active' ? <VideocamIcon color="success" /> : <VideocamOffIcon color="error" />}
                {mainFeed.name}
              </Typography>
            </Box>
            
            <StatusChip 
              label={mainFeed.status.toUpperCase()} 
              status={mainFeed.status}
              size="small"
            />
            
            {/* Main video feed placeholder */}
            <Box sx={{
              flex: 1,
              backgroundColor: 'black',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)',
                pointerEvents: 'none',
              },
            }}>
              <Typography color="white" variant="h6">Live Feed</Typography>
              <Typography color="grey.300" variant="body2">{mainFeed.type}</Typography>
            </Box>
          </VideoFeedContainer>

          {/* Thumbnail Video Feeds */}
          <Box sx={{ 
            height: { xs: '25vh', md: '35%' }, 
            mt: { xs: 1, sm: 2 },
            overflow: 'hidden'
          }}>
            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{
              flexWrap: { xs: 'nowrap', sm: 'wrap' },
              overflow: { xs: 'auto', sm: 'visible' },
              width: { xs: 'auto', sm: '100%' },
              pb: { xs: 2, sm: 0 },
              '::-webkit-scrollbar': {
                height: '8px',
              },
              '::-webkit-scrollbar-track': {
                backgroundColor: 'background.paper',
              },
              '::-webkit-scrollbar-thumb': {
                backgroundColor: 'grey.400',
                borderRadius: '4px',
              },
            }}>
              {dummyVideoFeeds.map((feed) => (
                <Grid 
                  item 
                  xs={8}
                  sm={4}
                  md={3}
                  key={feed.id}
                  sx={{ 
                    minWidth: { xs: '200px', sm: 'auto' }
                  }}
                >
                  <VideoFeedContainer
                    onClick={() => setMainFeed(feed)}
                    isFullscreen={false}
                    sx={{ 
                      height: { xs: '120px', sm: '150px' },
                      cursor: 'pointer',
                      opacity: feed.status === 'inactive' ? 0.7 : 1,
                      border: mainFeed.id === feed.id ? `2px solid ${theme.palette.primary.main}` : undefined,
                    }}
                  >
                    <Typography variant="subtitle2" noWrap sx={{ mb: 1 }}>
                      {feed.name}
                    </Typography>
                    
                    <Box sx={{
                      flex: 1,
                      backgroundColor: 'black',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}>
                      <Typography color="grey.300" variant="caption">
                        {feed.type}
                      </Typography>
                    </Box>
                  </VideoFeedContainer>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
        
        {/* Map Section - Now visible on all screen sizes */}
        <Grid item xs={12} md={fullscreenFeed ? 12 : 4} sx={{ height: { xs: '300px', md: '100%' } }}>
          <Paper sx={{ 
            height: '100%', 
            p: { xs: 1, sm: 2 },
            borderRadius: theme.shape.borderRadius * 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            '& .leaflet-container': {
              borderRadius: theme.shape.borderRadius,
              flex: 1,
              minHeight: 0,
            },
          }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              pb: 1,
              borderBottom: `1px solid ${theme.palette.divider}`,
              fontWeight: 500,
            }}>
              Live Tracking Map
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MapContainer
                markers={trackingData}
                selectedMarker={selectedCamera}
                onMarkerClick={setSelectedCamera}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Modal
        open={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        aria-labelledby="camera-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '85%', md: '70%' },
          maxWidth: '800px',
          bgcolor: 'background.default',
          boxShadow: theme.shadows[8],
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: theme.shape.borderRadius * 2,
        }}>
          <Typography id="camera-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Capture Image from {selectedCameraForCapture?.name}
          </Typography>
          
          <Box sx={{
            width: '100%',
            aspectRatio: '16/9',
            bgcolor: 'black',
            borderRadius: 1,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              Camera Preview
            </Typography>
            {selectedCameraForCapture && (
              <Typography variant="caption" color="grey.400">
                Location: {selectedCameraForCapture.location.lat.toFixed(4)}, {selectedCameraForCapture.location.lng.toFixed(4)}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <IconButton
              onClick={() => setIsCameraModalOpen(false)}
              color="inherit"
              size="large"
            >
              <FullscreenExitIcon />
            </IconButton>
            <IconButton
              onClick={handleCapture}
              color="primary"
              size="large"
            >
              <CameraAltIcon />
            </IconButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};
export default CameraFeedsView; 