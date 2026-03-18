import DeviceModelServices from "../services/DeviceModelServices";
import SettingService from "../services/SettingService";
import StockServices from "../services/StockServices";
import UserServices from "../services/UserServices";
import ManufacturerServices from "../services/ManufacturerServices";
import DealerServices from "../services/DealerServices";
import TaggingService from "../services/TaggingService";
import axios from "axios";

export const retriveAwaitingList = async () => {
  try {
    const response = await TaggingService.tagApprovedOwnerApproval();
    if (response.data.length === 0) {
      return [{ value: "", label: 'Data Found' }]
    }
    const list = response.data.map(device => ({
      value: device.device,
      label: device.vehicle_reg_no,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
    return [{ value: '', label: 'No Data' }]
  }
};
export const retriveDeviceModelList = async (data) => {
  try {
    const response = await DeviceModelServices.getDeviceList(data);
    const list = response.data.data.map(device => ({
      value: device.id,
      label: device.imei,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
    return [{ value: '', label: 'Unable to fetch' }]
  }
};
export const retriveModelList = async () => {
  try {
    const response = await DeviceModelServices.getAllModels();
    const list = response.data.map(device => ({
      value: device.id,
      label: device.model_name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
    return { status: 500 }
  }
};
export const filterModelList = async (data) => {
  try {
    const response = await DeviceModelServices.getFilterModels(data);
    if (response.data.length === 0) {
      return [{ value: "", label: 'No Approved Models' }]
    }
    const list = response.data.map(device => ({
      value: device.id,
      label: device.model_name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
    return { status: 500 }
  }
};

export const retriveStateList = async () => {
  try {
    const response = await SettingService.filter_settings_State();
    if (response.data.length === 0) {
      return [{ value: "", label: 'No State Found' }]
    }
    const list = response.data.map(device => ({
      value: device.id,
      label: device.state,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};

export const retriveStateListPub = async () => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}api/pub/Settings/filter_settings_State_pub/`,
      {}
    );
    if (response.data.length === 0) {
      return [{ value: "", label: "No State Found" }];
    }
    const list = response.data.map((device) => ({
      value: device.id,
      label: device.state,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};
export const retriveSOSLead = async () => {
  try {
    let filteredData = [];
    const response = await UserServices.fetchSOSUser({ user_type: "teamlead" });
    if (response.data.length === 0) {
      return [{ value: "", label: 'No Data Found' }]
    }
    if (response?.data) {
      filteredData = response?.data.filter(item => item.user_type === "teamlead")
    }
    const list = filteredData.map(user => ({
      value: user.id,
      label: user.users[0].name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
export const retriveSOSMember = async () => {
  try {
    let filteredData = [];
    const response = await UserServices.fetchSOSUser();
    if (response.data.length === 0) {
      return [{ value: "", label: 'No Data Found' }]
    }

    if (response?.data) {
      filteredData = response?.data.filter(item => item.user_type !== "teamlead")
    }
    const list = filteredData.map(user => ({
      value: user.id,
      label: user.users[0].name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
export const retriveDistrictList = async (filter) => {
  try {
    const response = await SettingService.filter_settings_District(filter);
    const list = response.data.map(device => ({
      value: device.id,
      label: device.district,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
export const retriveDTOList = async (filter) => {
  try {
    const response = await SettingService.filter_settings_District(filter);
    const list = response.data.map(device => ({
      value: device?.district_code,
      label: device?.district_code,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
export const retriveManufacturerList = async () => {
  try {
    const response = await ManufacturerServices.findManufacturer();
    const list = response.data.map(manufacturer => ({
      value: manufacturer.id,
      label: manufacturer.company_name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
};
export const fetchDeviceListForSale = async () => {
  try {
    const filter = {
      esim_status: "ESIM_Active_Confirmed"
    };
    const response = await StockServices.stockFilter(filter);
    const list = response.data.data.map((device) => ({
      value: device.id,
      label: device.imei,
    }));
    const uniqueList = [
      ...new Map(list.map((item) => [item["value"], item])).values(),
    ];
    return uniqueList;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};
export const fetchDeviceListForTagging = async () => {
  try {
    const filter = {
      esim_status: "ESIM_Active_Confirmed",
      stock_status: "Available_for_fitting"
    };
    const response = await StockServices.stockFilter(filter);
    const list = response.data.data.map((device) => ({
      value: device.id,
      label: device.imei,
    }));
    const uniqueList = [
      ...new Map(list.map((item) => [item["value"], item])).values(),
    ];
    return uniqueList;
  } catch (error) {
    console.error("fetchDeviceListForTagging error:", error.response?.data || error.message);
    // Return empty fallback so the dropdown doesn’t crash
    return [];
  }
};
export const fetchEsimProvider = async () => {
  try {
    const response = await StockServices.getProviderList();
    const provider = response.data;
    const list = Object.keys(provider)
      .filter((key) => provider[key] === "active")
      .map((key) => ({ value: key, label: key }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};
export const retriveDealerList = async () => {
  try {
    const res = await DealerServices.dealerList();
    if (res.data.length === 0) {
      return [{ value: '', label: 'No Approved Dealer' }]
    }
    const filtered = res.data.filter((item) => item.users[0].status === 'active');
    const arrayList = filtered.map(dealer => ({
      value: dealer.id,
      label: dealer.company_name,
    }));

    return arrayList;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('No Data Found')
    } else {
      console.log('No Data Found')
    }
  }
}
export const retriveVehicleOwner = async () => {
  try {
    const response = await UserServices.fetchVehicleOwner();
    if (response.data.length === 0) {
      return [{ value: '', label: 'No Owner' }];
    }
    const filtered = response.data.filter((item) => item.users[0].status === 'active');
    const list = filtered.map((owner) => ({
      value: owner.id,
      label: owner.users[0].name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};
export const retriveCreatedSimProvider = async (data) => {
  try {
    const response = await UserServices.fetchSimProvider(data);
    const filtered = response.data.filter((simProvider) => simProvider.users[0].status !== 'pending');
    const list = filtered.map((simProvider) => ({
      value: simProvider.id,
      label: simProvider.users[0].name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
    return [{ value: '', label: 'No Data Found' }]
  }
};

export const retriveCreatedSimProviderPub = async (data) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_BASE_URL}api/pub/eSimProvider/filter_eSimProvider/`,
      data || {}
    );
    const filtered = (response?.data || []).filter(
      (simProvider) => simProvider?.users?.[0]?.status !== "pending"
    );
    const list = filtered.map((simProvider) => ({
      value: simProvider.id,
      label: simProvider?.users?.[0]?.name,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
    return [{ value: "", label: "No Data Found" }];
  }
};
export const fetchVehicleCategory = async () => {
  try {
    const resp = await SettingService.filter_settings_VehicleCategory();
    const list = resp.data.map((category) => ({
      value: category.id,
      label: category.category,
    }));
    return list;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
  }
};

export const fetchTaggedList = async (data) => {
  try {
    const filter = data ? data : {
      is_tagged: false,
    };
    const response = await DeviceModelServices.getDeviceList(filter);
    const list = response.data.data.map((device) => ({
      value: device.id,
      label: device.imei,
    }));
    const uniqueList = [
      ...new Map(list.map((item) => [item["value"], item])).values(),
    ];
    return uniqueList;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("No Data Found");
    } else {
      console.log("No Data Found");
    }
    return [{ value: '', label: 'No Data Found' }]
  }
};

export const updateObjectValues = (targetObject, sourceObject, excludeKeys = []) => {
  for (const key in targetObject) {
    if (sourceObject.hasOwnProperty(key) && !excludeKeys.includes(key)) {
      targetObject[key] = sourceObject[key];
    }
  }
};

export const convertErrorObjectToArray = (errorObject) => {
  if (errorObject?.error) {
    return errorObject?.error
  } else {
    return Object.entries(errorObject).map(([key, value]) => ({
      field: key,
      message: value[0] // Assuming there's only one error message per field
    }));
  }

};

export const cipherEncryption = (salt) => {
  const textToChars = (text) => {
    const val = (text === null || text === undefined) ? "" : String(text);
    return val.split('').map(c => c.charCodeAt(0));
  };
  const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);

  return (text) => {
    const val = (text === null || text === undefined) ? "" : String(text);
    return val.split('')
      .map(c => c.charCodeAt(0))
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
  };
};

export const decipherEncryption = (salt) => {
  const textToChars = text => text.split('').map(c => c.charCodeAt(0));
  const applySaltToChar = code => textToChars(salt).reduce((a, b) => a ^ b, code);
  return (encoded) => {
    if (!encoded || typeof encoded !== 'string') return "";
    const matches = encoded.match(/.{1,2}/g);
    if (!matches) return "";
    return matches
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
  };
};

export const getRole = () => {
  const myDecipher = decipherEncryption("skytrack");
  const userData = sessionStorage.getItem("cookiesData") || localStorage.getItem("cookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));
  const userRoles = userData && data.length > 2 && data[1];
  return userRoles
}
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
export const dateTimeUpdate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

}
export const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
export const openFile = async (e, filePath) => {
  let splitData = filePath.split("/");
  let filename = splitData.length >= 1 && splitData[splitData.length - 1];
  e.preventDefault();
  try {
    const response = await SettingService.file_Download({
      file_path: filePath,
    });
    const contentDisposition = response.headers["content-disposition"];
    let fileName = filename;
    if (contentDisposition && contentDisposition.includes("attachment")) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    const contentType = response.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([response.data], { type: contentType });
    if (blob.size === 0) {
      throw new Error("The downloaded file is empty.");
    }

    // Create URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create temporary link element
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    // Append to body, click and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL
    setTimeout(() => window.URL.revokeObjectURL(url), 60000); // revoke after 1 minute
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

export const formatDateTime = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== 'string') {
    return "Invalid date-time format!";
  }

  // Always treat input as UTC and convert to IST for display
  const dateObj = new Date(dateTimeString);
  if (!isNaN(dateObj.getTime())) {
    const utc = dateObj.getTime() + (dateObj.getTimezoneOffset() * 60000);
    const istOffset = 5.5 * 60 * 60000;
    const istDate = new Date(utc + istOffset);
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, '0');
    const day = String(istDate.getDate()).padStart(2, '0');
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    const seconds = String(istDate.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} \n ${hours}:${minutes}:${seconds} IST`;
  }

  // If not a valid date, fallback to string split
  let datePart = "";
  let timePart = "";
  if (dateTimeString.includes('T')) {
    [datePart, timePart] = dateTimeString.split('T');
    timePart = timePart.replace(/\..*$/, '').replace(/Z$/, '');
  } else if (dateTimeString.includes(' ')) {
    [datePart, timePart] = dateTimeString.split(' ');
  } else {
    timePart = dateTimeString;
  }
  let formatted = "";
  if (datePart) {
    formatted += datePart;
  }
  if (timePart) {
    formatted += (datePart ? ' \n ' : '') + timePart + ' IST';
  }
  return formatted || "Invalid date-time format!";
}



