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