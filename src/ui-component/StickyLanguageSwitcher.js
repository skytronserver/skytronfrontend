import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Fab,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Box,
  Fade,
  Paper,
  Typography,
  Zoom
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { IconLanguage } from '@tabler/icons';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  { code: 'as', label: 'অসমীয়া', flag: '🇮🇳' }
];

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: 20,
  right: 20,
  zIndex: 1099,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  '&:hover': {
    transform: 'translateY(-5px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.25)',
    backgroundColor: theme.palette.primary.dark,
  },
  animation: 'pulse 2s infinite',
  '@keyframes pulse': {
    '0%': {
      boxShadow: `0 0 0 0 ${theme.palette.primary.main}80`,
    },
    '70%': {
      boxShadow: `0 0 0 10px ${theme.palette.primary.main}00`,
    },
    '100%': {
      boxShadow: `0 0 0 0 ${theme.palette.primary.main}00`,
    },
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 16,
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  padding: '12px 18px',
  margin: '4px',
  borderRadius: 10,
  transition: 'all 0.2s ease',
  backgroundColor: selected ? `${theme.palette.primary.main}20` : 'transparent',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}10`,
    transform: 'translateX(5px)'
  }
}));

const LanguageFlag = styled(Box)({
  marginRight: 15,
  fontSize: '22px',
  display: 'flex',
  alignItems: 'center'
});

const LangLabel = styled(Typography)(({ theme, selected }) => ({
  fontWeight: selected ? 600 : 400,
  color: selected ? theme.palette.primary.main : 'inherit',
  transition: 'all 0.2s ease',
}));

const StickyLanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    handleClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? 'language-popover' : undefined;

  return (
    <>
      <Zoom in={true} style={{ transitionDelay: '500ms' }}>
        <StyledFab 
          color="primary" 
          aria-label="switch language" 
          onClick={handleClick}
          size="medium"
        >
          <IconLanguage stroke={1.5} size="1.5rem" />
        </StyledFab>
      </Zoom>
      
      <StyledPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <Paper elevation={0} sx={{ background: 'rgba(255, 255, 255, 0.95)' }}>
          <List sx={{ p: 1, width: 200 }}>
            {languages.map((lang) => {
              const isSelected = i18n.language.startsWith(lang.code);
              return (
                <StyledListItemButton
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  selected={isSelected}
                >
                  <LanguageFlag>{lang.flag}</LanguageFlag>
                  <ListItemText 
                    primary={
                      <LangLabel 
                        variant="body2" 
                        selected={isSelected}
                      >
                        {lang.label}
                      </LangLabel>
                    } 
                  />
                </StyledListItemButton>
              );
            })}
          </List>
        </Paper>
      </StyledPopover>
    </>
  );
};

export default StickyLanguageSwitcher; 