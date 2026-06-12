import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { canViewMenu } from '../../../../../utils/rbacUtils';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

const NavGroup = ({ item, role, permissions }) => {
  const theme = useTheme();
  const { t } = useTranslation();

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

  // menu list collapse & items
  const items = item.children?.map((menu) => {
  
    switch (menu.type) {
      case 'collapse': {
        const canView = canViewMenu(menu.id, role, permissions, menu.roles);
        return canView ? <NavCollapse key={menu.id} menu={menu} level={1} role={role} permissions={permissions} /> : null;
      }
      case 'item': {
        const canView = canViewMenu(menu.id, role, permissions, menu.roles);
        return canView ? <NavItem key={menu.id} item={menu} level={1} permissions={permissions} /> : null;
      }
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return (
    <>
      <List
        subheader={
          item.title && (
            <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} display="block" gutterBottom>
              {t(getTranslationKey(item.title), { fallbackLng: 'en', defaultValue: item.title })}
              {item.caption && (
                <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                  {item.caption}
                </Typography>
              )}
            </Typography>
          )
        }
      >
        {items}
      </List>

      {/* group divider */}
      <Divider sx={{ mt: 0.25, mb: 1.25 }} />
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object,
  role: PropTypes.string
};

export default NavGroup;
