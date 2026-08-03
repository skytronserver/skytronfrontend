import DeviceModelServices from "../services/DeviceModelServices";
import SettingService from "../services/SettingService";
import StockServices from "../services/StockServices";
import UserServices from "../services/UserServices";
import ManufacturerServices from "../services/ManufacturerServices";
import DealerServices from "../services/DealerServices";
import TaggingService from "../services/TaggingService";
import axios from "axios";

export const isCertValid = (modelObj) => {
  if (!modelObj) return true; 
  const todayStr = new Date().toISOString().split('T')[0];
  const tacValidity = modelObj.tac_validity || modelObj.device_model?.tac_validity || "";
  const copValidity = modelObj.cop_validity || modelObj.device_model?.cop_validity || "";

  // If both are missing, we don't have enough info to block, so we allow it (fallback)
  if (!tacValidity && !copValidity) return true;

  // A model is valid if EITHER TAC is valid OR COP is valid
  const isTacValid = tacValidity && tacValidity >= todayStr;
  const isCopValid = copValidity && copValidity >= todayStr;
  return isTacValid || isCopValid;
};

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
    const devices = response.data.data || [];
    
    // Filter out devices with expired TAC/COP
    const validDevices = devices.filter(device => isCertValid(device.model || device.device_model || device));

    const list = validDevices.map(device => ({
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
export const retriveTechnicalOnboardedModelList = async () => {
  try {
    const res = await DeviceModelServices.listManufacturerTechnicalOnboardingRequests({});
    const data = res?.data;
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
          ? data.data
          : [];

    const eligibleModels = [];

    rows.forEach((r) => {
      // 1. Get statuses from the correct paths in the JSON
      const requestStatus = String(r?.status || "").trim().toLowerCase();
      const manufacturerStatus = String(r?.manufacturer?.status || "").trim().toLowerCase();
      // const userStatus = String(r?.manufacturer?.users?.[0]?.status || "").trim().toLowerCase();
      // const modelStatus = String(r?.device_model?.status || "").trim().toLowerCase();
      
      // 2. Determine if this request is officially 'Ready'
      // A model is only ready AFTER State Admin final approval.
      const isActiveManufacturer = 
        manufacturerStatus === "stateadminapproved" ||
        manufacturerStatus === "active" || 
        manufacturerStatus === "allow to add dealer";

      const isApprovedRequest = 
        requestStatus === "stateadminapproved" ||
        requestStatus === "active" || 
        requestStatus === "technicalonboardingapproved" ||
        requestStatus === "accepted"; // support legacy 'accepted' final status

      // Models must be fully approved by state admin to show in stock
      const isReady = isActiveManufacturer || isApprovedRequest;

      // 3. Extract the model details (prioritize the device_model object)
      const modelObj = r.device_model || r;

      // Check validity (Point C: Do not allow expired TAC/COP)
      const isCertValidStatus = isCertValid(modelObj);

      if (isReady && isCertValidStatus) {
        if (modelObj.model_name) {
          eligibleModels.push({
            value: String(modelObj.id), 
            label: modelObj.model_name,
          });
        }

        // Handle legacy nested structure just in case
        if (Array.isArray(r.tech_onboarded_models)) {
          r.tech_onboarded_models.forEach((m) => {
             const nestedModel = m.device_model || m;
             if (isCertValid(nestedModel)) {
                eligibleModels.push({
                  value: String(m.id),
                  label: m.model_name || m.device_model?.model_name || String(m.id),
                });
             }
          });
        }
      }
    });

    // Deduplicate models by value (ID)
    const uniqueModels = [...new Map(eligibleModels.map((m) => [m.value, m])).values()];
    return uniqueModels;
  } catch (e) {
    console.error("retriveTechnicalOnboardedModelList error:", e);
    return [];
  }
}

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

export const retriveTechnicalOnboardedManufacturerList = async () => {
  try {
    const response = await ManufacturerServices.findManufacturer();
    const data = response.data || [];
    
    const list = data.filter(m => {
        const userStatus = String(m?.users?.[0]?.status || "").trim().toLowerCase();
        const requestStatus = String(m?.status || "").trim().toLowerCase();
        
        // As per user definition: Onboarded users are those who have set their password and can login.
        // This corresponds to 'active' or 'allow to add dealer' statuses.
        return userStatus === "active" || 
               userStatus === "allow to add dealer" || 
               requestStatus === "active" || 
               requestStatus === "allow to add dealer" ||
               requestStatus === "stateadminapproved" ||
               requestStatus === "approved" ||
               requestStatus === "technicalonboardingapproved";
    }).map(manufacturer => ({
      value: manufacturer.id,
      label: manufacturer.company_name,
    }));
    
    // Deduplicate manufacturers by value (ID)
    const uniqueList = [...new Map(list.map((item) => [item.value, item])).values()];
    
    // Sort alphabetically for better UX
    uniqueList.sort((a, b) => a.label.localeCompare(b.label));
    
    return uniqueList;
  } catch (error) {
    console.error("retriveTechnicalOnboardedManufacturerList error:", error);
    return [];
  }
};
export const fetchDeviceListForSale = async () => {
  try {
    const filter = {
      esim_status: "ESIM_Active_Confirmed"
    };
    const response = await StockServices.stockFilter(filter);
    const devices = response.data.data || [];
    const validDevices = devices.filter(device => isCertValid(device.model || device.device_model || device));

    const list = validDevices.map((device) => ({
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
    const devices = response.data.data || [];

    // New vehicle: 1-year SIM plan → validity > today AND < 2 years from today (date only, no time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    twoYearsFromNow.setHours(0, 0, 0, 0);

    const validDevices = devices.filter(device => {
      if (device.is_tagged === true) return false;  // exclude already-tagged devices
      if (!isCertValid(device.model || device.device_model || device)) return false;
      const validity = device.esim_validity;
      if (!validity) return false;
      // Compare date-only (strip time to avoid timezone issues)
      const validityDate = new Date(validity.split('T')[0]);
      return validityDate > today && validityDate < twoYearsFromNow;
    });

    const list = validDevices.map((device) => ({
      value: device.id,
      label: device.imei,
    }));
    const uniqueList = [
      ...new Map(list.map((item) => [item["value"], item])).values(),
    ];
    return uniqueList;
  } catch (error) {
    console.error("fetchDeviceListForTagging error:", error.response?.data || error.message);
    // Return empty fallback so the dropdown doesn't crash
    return [];
  }
};

export const fetchDeviceListForOldVehicle = async () => {
  try {
    const filter = {
      esim_status: "ESIM_Active_Confirmed",
      stock_status: "Available_for_fitting"
    };
    const response = await StockServices.stockFilter(filter);
    const devices = response.data.data || [];

    // Old vehicle: 2-year SIM plan → validity >= 2 years from today (date only, no time)
    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
    twoYearsFromNow.setHours(0, 0, 0, 0);

    const validDevices = devices.filter(device => {
      if (device.is_tagged === true) return false;  // exclude already-tagged devices
      if (!isCertValid(device.model || device.device_model || device)) return false;
      const validity = device.esim_validity;
      if (!validity) return false;
      // Compare date-only (strip time to avoid timezone issues)
      const validityDate = new Date(validity.split('T')[0]);
      return validityDate >= twoYearsFromNow;
    });

    const list = validDevices.map((device) => ({
      value: device.id,
      label: device.imei,
    }));
    const uniqueList = [
      ...new Map(list.map((item) => [item["value"], item])).values(),
    ];
    return uniqueList;
  } catch (error) {
    console.error("fetchDeviceListForOldVehicle error:", error.response?.data || error.message);
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
      return [{ value: '', label: 'No Approved Dealer RFC(Retro Fitment Center)' }]
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
      label: simProvider.company_name,
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
      label: simProvider.company_name,
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

export const fetchVehicleCategoryCode = async () => {
  try {
    const resp = await SettingService.pub_list_VehicleCategoryCode();
    const list = resp.data.map((category) => ({
      value: category.id,
      label: category.category_code,
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
    const devices = response.data.data || [];
    const validDevices = devices.filter(device => isCertValid(device.model || device.device_model || device));

    const list = validDevices.map((device) => ({
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
  if (e && e.preventDefault) e.preventDefault();
  if (!filePath) return;

  // Sanitize the file path to remove any leading slash that might cause issues with the download API
  let sanitizedPath = filePath;
  if (typeof sanitizedPath === "string" && sanitizedPath.startsWith("/")) {
    sanitizedPath = sanitizedPath.substring(1);
  }

  let splitData = sanitizedPath.split("/");
  let filename = splitData.length >= 1 && splitData[splitData.length - 1];

  try {
    const response = await SettingService.file_Download({
      file_path: sanitizedPath,
    });
    const contentDisposition = response.headers["content-disposition"];
    let fileName = filename;
    if (contentDisposition && contentDisposition.includes("attachment")) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (fileNameMatch && fileNameMatch.length === 2) {
        fileName = fileNameMatch[1];
      }
    }
    const contentTypeRaw = response.headers["content-type"];
    let contentType = contentTypeRaw;

    // Improved detection: use file extension if server returns generic type
    const lowerFileName = fileName.toLowerCase();
    if (lowerFileName.endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg")) {
      contentType = "image/jpeg";
    } else if (lowerFileName.endsWith(".png")) {
      contentType = "image/png";
    } else if (!contentType) {
      contentType = "application/octet-stream";
    }

    const blob = new Blob([response.data], { type: contentType });
    if (blob.size === 0 || (response.data instanceof Blob && response.data.size === 0)) {
      throw new Error("File not found or empty.");
    }

    // Check if the response is actually a JSON error hidden in a Blob
    if (contentTypeRaw && contentTypeRaw.includes("application/json")) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      if (json.error) {
        throw new Error(json.error);
      }
    }

    // Create URL for the blob
    const url = window.URL.createObjectURL(blob);

    // If PDF or Image, open in a new window/tab for viewing and printing
    if (contentType === "application/pdf" || contentType.startsWith("image/")) {
      // Use anchor element as it is more reliable for bypassing popup blockers
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      // This is necessary for viewing and printing (it tells the browser to NOT download)
      // a.download = fileName; (Omit this to avoid forced download)
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create temporary link element for download
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;

      // Append to body, click and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    // Clean up the URL
    setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error("Error opening file:", error);
    alert(error.message || "Failed to open document. Please verify the file exists on the server.");
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



