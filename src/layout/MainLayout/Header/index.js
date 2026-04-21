import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Avatar, Box, ButtonBase,useMediaQuery, Typography, Button,  } from "@mui/material";
import { getRole,decipherEncryption  } from "../../../helper";
// project imports
import LogoSection from "../LogoSection";
import ProfileSection from "./ProfileSection";

// assets
import { IconMenu2,IconLogout } from "@tabler/icons";

// ==============================|| MAIN NAVBAR / HEADER ||============================== //

const Header = ({ handleLeftDrawerToggle }) => {
  const theme = useTheme();
  const { t } = useTranslation();

    // ✅ Detect screen size
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // ✅ Get user data (same logic as ProfileSection)
  const myDecipher = decipherEncryption("skytrack");
  const userData = localStorage.getItem("skytrackCookiesData");
  const data = userData && userData.split("-").map((item) => myDecipher(item));

  const userName = data && data.length > 2 ? data[3] : "User";

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      {/* logo & toggler button */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT SECTION */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LogoSection />

          <ButtonBase onClick={() => handleLeftDrawerToggle()}>
            <Avatar
              variant="rounded"
              sx={{
                ...theme.typography.commonAvatar,
                ...theme.typography.mediumAvatar,
                background: "#ffffff22",
                color: "#fff",
                "&:hover": {
                  background: "#ffffff44",
                },
              }}
              onClick={handleLeftDrawerToggle}
            >
              <IconMenu2 stroke={1.5} size="1.3rem" />
            </Avatar>
          </ButtonBase>
        </Box>

        {/* RIGHT SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {isMobile ? (
          // MOBILE → Keep old dropdown
          <ProfileSection />
        ) : (
          //  DESKTOP → Show direct info
          <>
            <Typography variant="h4" sx={{ color: "#fff" }}>
              {t("common.welcome")}, {userName}
            </Typography>

         <Box
  onClick={handleLogout}
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 0.8,
    cursor: "pointer",
    color: "rgba(255,255,255,0.85)",
    fontSize: "14px",
    fontWeight: 500,
    px: 1,
    py: 0.5,
    borderRadius: "6px",
    transition: "all 0.25s ease",

    "&:hover": {
      color: "#ef4444",
      background: "rgba(255,255,255,0.05)",
    },

    "& svg": {
      transition: "all 0.25s ease",
    },

    "&:hover svg": {
      transform: "translateX(2px)",
    },
  }}
>
  <IconLogout size={18} />
  <Typography
    variant="body2"
    sx={{
      fontWeight: 500,
      color:"rgba(255,255,255,0.85)",
    }}
  >
    {t("common.logout")}
  </Typography>
</Box>
          </>
        )}
      </Box>

      </Box>
    </>
  );
};

Header.propTypes = {
  handleLeftDrawerToggle: PropTypes.func,
};

export default Header;
