export const FETCH_VEHICLE_CATEGORY = 'FETCH_VEHICLE_CATEGORY';
export const FETCH_STATE_LIST='FETCH_STATE_LIST';
export const fetchVehicleCategory=(data)=>({
    type:FETCH_VEHICLE_CATEGORY,
    payload:data,
})
export const fetchStateList=(data)=>({
    type:FETCH_STATE_LIST,
    payload:data,
})