import React, { useState } from 'react';
import { 
  Fab, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography,
  Box,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Language } from '@mui/icons-material';
import { useLocalization } from '../hooks/useLocalization';

/**
 * FloatingLanguageSwitch - A floating action button for language switching
 * 
 * @param {Object} props - Component props
 * @param {string} props.position - Position of the floating button ('bottom-right', 'bottom-left', 'top-right', 'top-left')
 * @param {boolean} props.showOnMobile - Whether to show the button on mobile devices
 * @param {string} props.size - Size of the button ('small', 'medium', 'large')
 * @param {string} props.color - Color theme of the button ('primary', 'secondary', 'error', 'warning', 'info', 'success')
 * 
 * @example
 * // Basic usage
 * <FloatingLanguageSwitch />
 * 
 * @example
 * // Custom position and size
 * <FloatingLanguageSwitch position="top-left" size="medium" />
 * 
 * @example
 * // Hide on mobile
 * <FloatingLanguageSwitch showOnMobile={false} />
 * 
 * @example
 * // Custom color
 * <FloatingLanguageSwitch color="secondary" />
 */
const FloatingLanguageSwitch = ({ 
  position = 'bottom-right', 
  showOnMobile = true,
  size = 'large',
  color = 'primary'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentLanguage, changeLanguage, getAvailableLanguages, getCurrentLanguage } = useLocalization();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Hide on mobile if showOnMobile is false
  if (!showOnMobile && isMobile) {
    return null;
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    handleClose();
  };

  const currentLang = getCurrentLanguage();
  const availableLanguages = getAvailableLanguages();

  // Position styles based on position prop
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'fixed',
      zIndex: 1000,
    };

    switch (position) {
      case 'bottom-left':
        return { ...baseStyles, bottom: 24, left: 24 };
      case 'top-right':
        return { ...baseStyles, top: 24, right: 24 };
      case 'top-left':
        return { ...baseStyles, top: 24, left: 24 };
      case 'bottom-right':
      default:
        return { ...baseStyles, bottom: 24, right: 24 };
    }
  };

  // Size styles
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 48, height: 48 };
      case 'medium':
        return { width: 56, height: 56 };
      case 'large':
      default:
        return { width: 64, height: 64 };
    }
  };

  return (
    <>
      <Box sx={getPositionStyles()}>
        <Tooltip 
          title={`Current: ${currentLang.name} - Click to change language`} 
          placement={position.includes('right') ? 'left' : 'right'}
        >
          <Fab
            color={color}
            size={size}
            onClick={handleClick}
            sx={{
              ...getSizeStyles(),
              backgroundColor: `${color}.main`,
              '&:hover': {
                backgroundColor: `${color}.dark`,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              // Responsive adjustments
              ...(isMobile && {
                width: 56,
                height: 56,
              }),
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 0.5,
              ...(isMobile && { gap: 0.25 })
            }}>
              <Language sx={{ 
                fontSize: size === 'small' ? 20 : size === 'medium' ? 22 : 24,
                ...(isMobile && { fontSize: 20 })
              }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: size === 'small' ? '0.6rem' : size === 'medium' ? '0.65rem' : '0.7rem',
                  fontWeight: 'bold', 
                  lineHeight: 1,
                  ...(isMobile && { fontSize: '0.6rem' })
                }}
              >
                {currentLang.code.toUpperCase()}
              </Typography>
            </Box>
          </Fab>
        </Tooltip>
      </Box>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: isMobile ? 160 : 180,
            mt: 1,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderRadius: 2,
          }
        }}
        transformOrigin={{ 
          horizontal: position.includes('right') ? 'right' : 'left', 
          vertical: 'top' 
        }}
        anchorOrigin={{ 
          horizontal: position.includes('right') ? 'right' : 'left', 
          vertical: 'bottom' 
        }}
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              py: isMobile ? 1 : 1.5,
              px: isMobile ? 1.5 : 2,
              '&.Mui-selected': {
                backgroundColor: `${color}.main`,
                color: `${color}.contrastText`,
                '&:hover': {
                  backgroundColor: `${color}.dark`,
                }
              },
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: isMobile ? 32 : 36 }}>
              <span style={{ fontSize: isMobile ? '1.1rem' : '1.3rem' }}>{language.flag}</span>
            </ListItemIcon>
            <ListItemText>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: currentLanguage === language.code ? 'bold' : 'normal',
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }}
              >
                {language.name}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  opacity: 0.7,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {language.code.toUpperCase()}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default FloatingLanguageSwitch; 