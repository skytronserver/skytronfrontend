import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';

// assets
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { IconChevronDown, IconChevronUp } from '@tabler/icons';

// ==============================|| SIDEBAR MENU LIST COLLAPSE ITEMS ||============================== //

const NavCollapse = ({ menu, level, role }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const customization = useSelector((state) => state.customization);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleClick = () => {
    setOpen(!open);
    setSelected(!selected ? menu.id : null);
    // if (menu?.id !== 'authentication') {
    //   navigate(menu.children[0]?.url);
    // }
  };

  const { pathname } = useLocation();
  const checkOpenForParent = (child, id) => {
    child.forEach((item) => {
      if (item.url === pathname) {
        setOpen(true);
        setSelected(id);
      }
    });
  };

  // menu collapse for sub-levels
  useEffect(() => {
    setOpen(false);
    setSelected(null);
    if (menu.children) {
      menu.children.forEach((item) => {
        if (item.children?.length) {
          checkOpenForParent(item.children, menu.id);
        }
        if (item.url === pathname) {
          setSelected(menu.id);
          setOpen(true);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, menu.children]);

  // menu collapse & item
  const menus = menu.children?.map((item) => {
    
    switch (item.type) {
      case 'collapse':
        const collapse = item.roles ? (item.roles.includes(role) ? <NavCollapse key={item.id} menu={item} level={level + 1} role={role}/> : '') : <NavCollapse key={item.id} menu={item} level={level + 1} role={role}/>;
        return collapse;
      case 'item':
        
        const navItem = item.roles ? (item.roles.includes(role) ? <NavItem key={item.id} item={item} level={level + 1} /> : '') : <NavItem key={item.id} item={item} level={level + 1} />;
        return navItem;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  // Get translation key based on menu title
  const getTranslationKey = (title) => {
    // Special case for "Create New"
    if (title === "Create New") {
      return "menu.register";
    }
    
    // Convert title to camelCase for menu.* keys
    const camelTitle = title
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word, index) => 
        index === 0 
          ? word.toLowerCase() 
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
    
    return `menu.${camelTitle}`;
  };

  const Icon = menu.icon;
  const menuIcon = menu.icon ? (
    <Icon strokeWidth={1.5} size="1.3rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
  ) : (
    <FiberManualRecordIcon
      sx={{
        width: selected === menu.id ? 8 : 6,
        height: selected === menu.id ? 8 : 6
      }}
      fontSize={level > 0 ? 'inherit' : 'medium'}
    />
  );

  return (
    <>
      <ListItemButton
        sx={{
          borderRadius: `${customization.borderRadius}px`,
          mb: 0.5,
          alignItems: 'flex-start',
          py: level > 1 ? 1 : 1.25,
          pl: `${level * 24}px`
        }}
        selected={selected === menu.id}
        onClick={handleClick}
      >
        <ListItemIcon sx={{ my: 'auto', minWidth: !menu.icon ? 18 : 36 }}>{menuIcon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant={selected === menu.id ? 'h5' : 'body1'} color="inherit" sx={{ my: 'auto' }}>
              {t(getTranslationKey(menu.title), { fallbackLng: 'en', defaultValue: menu.title })}
            </Typography>
          }
          secondary={
            menu.caption && (
              <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                {menu.caption}
              </Typography>
            )
          }
        />
        {open ? (
          <IconChevronUp stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        ) : (
          <IconChevronDown stroke={1.5} size="1rem" style={{ marginTop: 'auto', marginBottom: 'auto' }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List
          component="div"
          disablePadding
          sx={{
            position: 'relative',
            '&:after': {
              content: "''",
              position: 'absolute',
              left: '32px',
              top: 0,
              height: '100%',
              width: '1px',
              opacity: 1,
              background: theme.palette.primary.light
            }
          }}
        >
          {menus}
        </List>
      </Collapse>
    </>
  );
};

NavCollapse.propTypes = {
  menu: PropTypes.object,
  level: PropTypes.number,
  role: PropTypes.string
};

export default NavCollapse;
