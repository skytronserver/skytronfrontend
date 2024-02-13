import {CircularProgress} from "@mui/material";
const CustomLoader = () => {
  return (
    <div
    style={{
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 9999,
      background: "rgba(255, 255, 255, 0.8)",
    }}
  >
    <CircularProgress
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }}
      size={50}
    />
  </div>
  )
}

export default CustomLoader