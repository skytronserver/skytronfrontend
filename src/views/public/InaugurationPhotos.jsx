import React, { useState } from 'react';
import { Box, Typography, Container, Grid, Card, CardMedia, CardActionArea, Breadcrumbs, Link as MuiLink, Dialog, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import one from "../../assets/images/inauguration/one.jpeg";
import two from "../../assets/images/inauguration/two.jpeg";
import three from "../../assets/images/inauguration/three.jpeg";
import four from "../../assets/images/inauguration/four.jpeg";

const InaugurationPhotos = () => {
  const { t } = useTranslation();
  
  const [open, setOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const handleOpen = (photo) => {
    setSelectedPhoto(photo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const photos = [
    { src: one, title: 'Inauguration Moment 1' },
    { src: two, title: 'Inauguration Moment 2' },
    { src: three, title: 'Inauguration Moment 3' },
    { src: four, title: 'Inauguration Moment 4' },
  ];

  return (
    <Box 
      sx={{ 
        py: { xs: 3, md: 5 }, 
        px: 2, 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
        minHeight: '100vh' 
      }}
    >
      <Container maxWidth="lg">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 4 }}>
          <MuiLink 
            component={Link} 
            underline="hover" 
            color="primary" 
            to="/"
            sx={{ fontWeight: 500 }}
          >
            {t('common.home')}
          </MuiLink>
          <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
            {t('common.inaugurationPhotos')}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography 
            variant="h3" 
            component="h1"
            gutterBottom 
            sx={{ 
              fontWeight: 800, 
              color: '#4a148c',
              mb: 1.5,
              fontSize: { xs: '2rem', md: '2.8rem' },
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              letterSpacing: '-0.01em'
            }}
          >
            {t('common.inaugurationPhotos')}
          </Typography>
          <Box 
            sx={{ 
              width: '80px', 
              height: '4px', 
              backgroundColor: '#9c27b0', 
              margin: '0 auto',
              borderRadius: '2px'
            }} 
          />
        </Box>

        <Grid container spacing={4}>
          {photos.map((photo, index) => (
            <Grid item xs={12} sm={6} md={6} lg={4} key={index}>
              <Card 
                sx={{ 
                  borderRadius: 6, 
                  overflow: 'hidden', 
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'translateY(-10px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                    '& .MuiCardMedia-root': {
                      filter: 'brightness(1.1)'
                    }
                  }
                }}
                onClick={() => handleOpen(photo)}
              >
                <CardActionArea>
                  <CardMedia
                    component="img"
                    height="260"
                    image={photo.src}
                    alt={photo.title}
                    sx={{
                      objectFit: 'cover',
                      transition: 'filter 0.4s ease'
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      width: '100%', 
                      p: 3, 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                      color: 'white'
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {photo.title}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Lightbox Dialog */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="lg"
          PaperProps={{
            sx: {
              backgroundColor: 'transparent',
              boxShadow: 'none',
              overflow: 'visible'
            }
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: -40,
                top: -40,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.8)'
                },
                display: { xs: 'none', md: 'flex' }
              }}
            >
              <CloseIcon />
            </IconButton>
            
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 10,
                top: 10,
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1,
                display: { xs: 'flex', md: 'none' }
              }}
            >
              <CloseIcon />
            </IconButton>

            {selectedPhoto && (
              <Box
                component="img"
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  borderRadius: 4,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  display: 'block'
                }}
              />
            )}
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default InaugurationPhotos;
