import React from "react";
import { Box, Typography, Link } from "@mui/material";

const Footer = () => {
  return (
    <Box
  sx={{
    backgroundColor: "#1E293B",
    color: "#fff",
    px: { xs: 2, sm: 3 },
    py: { xs: 1, sm: 1.5 },

    display: "flex",
    flexDirection: { xs: "column", sm: "row" }, // 🔥 mobile fix
    justifyContent: "space-between",
    alignItems: { xs: "center", sm: "center" },
    textAlign: { xs: "center", sm: "left" },
    gap: { xs: 1, sm: 0 },

    fontSize: { xs: "12px", sm: "14px" },
  }}
>
      {/* LEFT TEXT */}
      <Typography sx={{ color: "#d1d5db" }}>
        © PreciTrack Mapwala Private Limited 2024
      </Typography>

      {/* RIGHT LINKS */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {["Terms & Conditions", "Privacy Policy", "Licensing"].map((item) => (
          <Link
            key={item}
            href="#"
            underline="none"
            sx={{
    display: "flex",
    gap: { xs: 1.5, sm: 3 },
    flexWrap: "wrap",
    justifyContent: "center",
  }}
          >
            {item}
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default Footer;