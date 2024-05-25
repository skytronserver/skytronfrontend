// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from '../../../../menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const role=menuItem.role;
  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        const group=item?.roles ? ( item.roles.includes(role) ? <NavGroup key={item.id} item={item} role={role}/> : ''): <NavGroup key={item.id} item={item} role={role}/>
        return group;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
