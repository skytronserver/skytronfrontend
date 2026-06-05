export const FETCH_VEHICLE_CATEGORY = 'FETCH_VEHICLE_CATEGORY';
export const FETCH_STATE_LIST='FETCH_STATE_LIST';
export const FETCH_DISTRICT_LIST='FETCH_DISTRICT_LIST';
export const FETCH_HP_FREQUENCY_LIST='FETCH_HP_FREQUENCY_LIST';
export const FETCH_OTA_LIST='FETCH_OTA_LIST';
export const FETCH_FIRMWARE_LIST='FETCH_FIRMWARE_LIST';
export const FETCH_IP_SETTING_LIST='FETCH_IP_SETTING_LIST';
export const FETCH_PERMIT_CONDITION_LIST='FETCH_PERMIT_CONDITION_LIST';
export const fetchVehicleCategory=(data)=>({
    type:FETCH_VEHICLE_CATEGORY,
    payload:data,
})
export const fetchStateList=(data)=>({
    type:FETCH_STATE_LIST,
    payload:data,
})
export const fetchDistrictList=(data)=>({
    type:FETCH_DISTRICT_LIST,
    payload:data,
})
export const fetchFrequencyList=(data)=>({
    type:FETCH_HP_FREQUENCY_LIST,
    payload:data,
})
export const fetchOtaList=(data)=>({
    type:FETCH_OTA_LIST,
    payload:data,
})
export const fetchFirmwareList=(data)=>({
    type:FETCH_FIRMWARE_LIST,
    payload:data,
})
export const fetchIPSettingList=(data)=>({
    type:FETCH_IP_SETTING_LIST,
    payload:data
})
export const fetchPermitConditionList=(data)=>({
    type:FETCH_PERMIT_CONDITION_LIST,
    payload:data,
})