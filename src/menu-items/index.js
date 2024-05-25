import dashboard from './dashboard';
import other from './other';
import user from './user'
// ==============================|| MENU ITEMS ||============================== //
import { decipherEncryption } from '../helper';
const myDecipher = decipherEncryption('skytrack')
const userData=sessionStorage.getItem('cookiesData');
const data=userData && userData.split("-").map(item=>myDecipher(item))
const userRoles=userData && data.length > 2 && data[1];
const menuItems = {
  items: [dashboard,user,other],
  role:userRoles
};

export default menuItems;
