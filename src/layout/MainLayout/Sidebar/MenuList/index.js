// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import menuItem from '../../../../menu-items';
import { useSelector } from 'react-redux';
import { decipherEncryption } from '../../../../helper';
// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const myDecipher = decipherEncryption('skytrack')
  const userData = useSelector((state) => state.login.cookiesData) || sessionStorage.getItem('cookiesData');
  const data = userData && userData.split("-").map(item=>myDecipher(item))
  const userRoles = userData && data.length > 2 && data[1];
  const role = menuItem.role || userRoles;

  const webRestrictedRoles = ["police_ex", "ambulance_ex","PCR","ACR"];
  if (webRestrictedRoles.includes(role)) {
    return null; 
  }

  const navItems = menuItem.items.map((item) => {
    switch (item.type) {
      case 'group':
        const group = item?.roles ? 
          (item.roles.includes(role) ? <NavGroup key={item.id} item={item} role={role}/> : '') 
          : <NavGroup key={item.id} item={item} role={role}/>;
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
