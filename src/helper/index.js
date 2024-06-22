import DeviceModelServices from "../services/DeviceModelServices";
import SettingService from "../services/SettingService";
import StockServices from "../services/StockServices";
import UserServices from "../services/UserServices";
import ManufacturerServices from "../services/ManufacturerServices";
export const retriveModelList = async () => {
  try {
    const response = await DeviceModelServices.getAllModels();
    const list=response.data.map(device => ({
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
  }
};

export const retriveStateList = async () => {
  try {
    const response = await SettingService.filter_settings_State();
    const list=response.data.map(device => ({
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
export const retriveDistrictList = async (filter) => {
    try {
      const response = await SettingService.filter_settings_District(filter);
      const list=response.data.map(device => ({
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
  export const retriveManufacturerList = async () => {
    try {
      const response = await ManufacturerServices.findManufacturer();
      const list=response.data.map(manufacturer => ({
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
        is_tagged: false,
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
export const retriveVehicleOwner = async () => {
    try {
      const response = await UserServices.fetchVehicleOwner();
      const list = response.data.map((owner) => ({
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
export const retriveCreatedSimProvider = async () => {
    try {
      const response = await UserServices.fetchSimProvider();
      const list = response.data.map((simProvider) => ({
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

  export const fetchTaggedList = async () => {
    try {
      const filter = {
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
    if(errorObject?.error){
      return errorObject?.error
    }else{
      return Object.entries(errorObject).map(([key, value]) => ({
        field: key,
        message: value[0] // Assuming there's only one error message per field
      }));
    }
    
  };

export const cipherEncryption = (salt) => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const byteHex = n => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);

    return text => text.split('')
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join('');
}
    
export const decipherEncryption = (salt) => {
    const textToChars = text => text.split('').map(c => c.charCodeAt(0));
    const applySaltToChar = code => textToChars(salt).reduce((a,b) => a ^ b, code);
    return encoded => encoded.match(/.{1,2}/g)
      .map(hex => parseInt(hex, 16))
      .map(applySaltToChar)
      .map(charCode => String.fromCharCode(charCode))
      .join('');
}

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};