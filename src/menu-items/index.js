import dashboard from './dashboard';
import other from './other';
import user from './user';
import schoolbus from './schoolbus';
import testAgency from './testAgency';
import pis from './pis';
// ==============================|| MENU ITEMS ||============================== //
import { decipherEncryption } from '../helper';
const myDecipher = decipherEncryption('skytrack')
const userData = sessionStorage.getItem('cookiesData');
const data = userData && userData.split("-").map(item => myDecipher(item))
const userRoles = userData && data.length > 2 && data[1];
const menuItems = {
  items: [dashboard, schoolbus, testAgency, user, pis, other],
  role: userRoles
};

export default menuItems;
