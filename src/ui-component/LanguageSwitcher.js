import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Popover,
  List,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { IconLanguage } from '@tabler/icons';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'as', label: 'অসমীয়া' }
];

const LanguageSwitcher = () => {
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
      <Button
        color="inherit"
        onClick={handleClick}
        startIcon={<IconLanguage stroke={1.5} size="1.3rem" />}
        sx={{ minWidth: 'auto', padding: '8px' }}
      >
        {i18n.language.substring(0, 2).toUpperCase()}
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <List sx={{ p: 0, width: 150 }}>
          {languages.map((lang) => (
            <ListItemButton
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              selected={i18n.language.startsWith(lang.code)}
            >
              <ListItemText primary={lang.label} />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default LanguageSwitcher; 