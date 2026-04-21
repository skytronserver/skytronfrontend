import { Typography, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AuthFooter = () => {
  const navigate = useNavigate();

  const linkStyle = {
    cursor: "pointer",
    fontSize: "13px",
    "&:hover": {
      textDecoration: "underline",
      color: "#38bdf8",
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        background: "#1E293B",
        color: "#fff",
        px: { xs: 2, sm: 3 },
        // py: 1.5,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1,
        // flexShrink: 0, 
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: { xs: "12px", sm: "13px" },
          width: { xs: "100%", sm: "auto" },
          textAlign: { xs: "center", sm: "left" },
                  color: "#fff",

        }}
      >
        © PreciTrack Mapwala Private Limited 2024
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          width: { xs: "100%", sm: "auto" },
          justifyContent: { xs: "center", sm: "flex-end" },
        }}
      >
        <Typography sx={linkStyle} onClick={() => navigate("/help")}>
          Help
        </Typography>

        <Typography sx={linkStyle} onClick={() => navigate("/map-policy")}>
          Map Policy
        </Typography>
      </Stack>
    </Box>
  );
};

export default AuthFooter;