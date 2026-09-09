import { useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
import { useLocation } from "react-router-dom";
import "./themes/styles.css"
// routing
import Routes from "./routes";

// defaultTheme
import themes from "./themes";

// project imports
import NavigationScroll from "./layout/NavigationScroll";
import StickyLanguageSwitcher from "./ui-component/StickyLanguageSwitcher";

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);
  const location = useLocation();
  const hideLanguageSwitcher = location.pathname.startsWith("/vehicle-status");

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Routes />
          {!hideLanguageSwitcher && <StickyLanguageSwitcher />}
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
