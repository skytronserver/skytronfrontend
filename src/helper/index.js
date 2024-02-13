import DeviceModelServices from "../services/DeviceModelServices";
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
export const updateObjectValues = (targetObject, sourceObject, excludeKeys = []) => {
    for (const key in targetObject) {
      if (sourceObject.hasOwnProperty(key) && !excludeKeys.includes(key)) {
        targetObject[key] = sourceObject[key];
      }
    }
  };

export const convertErrorObjectToArray = (errorObject) => {
    return Object.entries(errorObject).map(([key, value]) => ({
      field: key,
      message: value[0] // Assuming there's only one error message per field
    }));
  };