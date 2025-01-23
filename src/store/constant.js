// theme constant
export const gridSpacing = 3;
export const drawerWidth = 260;
export const appDrawerWidth = 320;
export const SET_USER = 'SET_USER';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';
export const VERIFY_OTP='VERIFY_OTP';
export const FILE_SIZE = 512 * 1024 ; // 512 KB
export const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "application/pdf"];
export const BASE_URL=process.env.REACT_APP_BASE_URL;
export const CUSTOM_BASE_URL=process.env.REACT_APP_CUSTOM_URL;
export const isoDatePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z/;
export const fullText={
  "L":"Live",
  "H":"History",
  "EA":"Emergency Alert",
  "E":"East",
  "N":"North",
  "S":"South",
  "W":"West"
}
export const keyMapping = {
    "id":"ID",
    "entry_time": "Date & Time",
    "vehicle_registration_number": "Vehicle Reg. No.",
    "odometer": "Odometer (km)",
    "imei": "IMEI",
    "packet_type": "Packet Type",
    "alert_id": "Alert ID",
    "packet_status": "Packet Status",
    "gps_status": "GPS Status",
    "date": "Date",
    "time": "Time",
    "latitude": "Latitude",
    "latitude_dir": "Latitude Direction",
    "longitude": "Longitude",
    "longitude_dir": "Longitude Direction",
    "speed": "Speed (km/h)",
    "heading": "Heading",
    "satellites": "Satellites",
    "altitude": "Altitude (m)",
    "pdop": "PDOP",
    "hdop": "HDOP",
    "network_operator": "Network Operator",
    "ignition_status": "Ignition Status",
    "main_power_status": "Main Power Status",
    "main_input_voltage": "Main Input Voltage (V)",
    "internal_battery_voltage": "Internal Battery Voltage (V)",
    "emergency_status": "Emergency Status",
    "box_tamper_alert": "Box Tamper Alert",
    "gsm_signal_strength": "GSM Signal Strength",
    "mcc": "MCC",
    "mnc": "MNC",
    "lac": "LAC",
    "cell_id": "Cell ID",
    "nbr1_cell_id": "Neighbor 1 Cell ID",
    "nbr1_lac": "Neighbor 1 LAC",
    "nbr1_signal_strength": "Neighbor 1 Signal Strength",
    "nbr2_cell_id": "Neighbor 2 Cell ID",
    "nbr2_lac": "Neighbor 2 LAC",
    "nbr2_signal_strength": "Neighbor 2 Signal Strength",
    "nbr3_cell_id": "Neighbor 3 Cell ID",
    "nbr3_lac": "Neighbor 3 LAC",
    "nbr3_signal_strength": "Neighbor 3 Signal Strength",
    "nbr4_cell_id": "Neighbor 4 Cell ID",
    "nbr4_lac": "Neighbor 4 LAC",
    "nbr4_signal_strength": "Neighbor 4 Signal Strength",
    "digital_input_status": "Digital Input Status",
    "digital_output_status": "Digital Output Status",
    "frame_number": "Frame Number",
    "device_tag": "Device Tag"
  };

  export const iconData = [
    {
      iconUrl: `${BASE_URL}static/track.png`,
      text: "All",
      color: "black",
      key: "default",
    },
    {
      iconUrl: `${BASE_URL}static/logo/red-skytron-transparent.png`,
      text: "Em. Alert",
      color: "red",
      key: "red",
    },
    {
      iconUrl: `${BASE_URL}static/logo/orange-skytron-transparent.png`,
      text: "Alert",
      color: "orange",
      key: "orange",
    },
    {
      iconUrl: `${BASE_URL}static/logo/blue-skytron-transparent.png`,
      text: "Eng On",
      color: "blue",
      key: "blue",
    },
    {
      iconUrl: `${BASE_URL}static/logo/green-skytron-transparent.png`,
      text: "Moving",
      color: "green",
      key: "green",
    },
    {
      iconUrl: `${BASE_URL}static/logo/grey-skytron-transparent.png`,
      text: "Offline",
      color: "grey",
      key: "grey",
    },
  ];

  export const iconStyles = {
    red: `${BASE_URL}static/logo/red-skytron-transparent.png`,
    orange: `${BASE_URL}static/logo/orange-skytron-transparent.png`,
    blue: `${BASE_URL}static/logo/blue-skytron-transparent.png`,
    green: `${BASE_URL}static/logo/green-skytron-transparent.png`,
    grey: `${BASE_URL}static/logo/grey-skytron-transparent.png`,
    default: `${BASE_URL}static/track.png`,
  };
