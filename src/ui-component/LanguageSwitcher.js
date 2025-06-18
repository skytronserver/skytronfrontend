import React, { useState } from 'react';
import { 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Typography 
} from '@mui/material';
import { Language } from '@mui/icons-material';
import { useLocalization } from '../hooks/useLocalization';

const LanguageSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentLanguage, changeLanguage, getAvailableLanguages, getCurrentLanguage } = useLocalization();

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

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        <Language />
        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {currentLang.flag} {currentLang.name}
        </Typography>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 150,
            mt: 1
          }
        }}
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={currentLanguage === language.code}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                }
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <span style={{ fontSize: '1.2rem' }}>{language.flag}</span>
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2">
                {language.name}
              </Typography>
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher; 