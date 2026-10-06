import { useSelector } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { TssCacheProvider } from "tss-react";
import { useLocation } from "react-router-dom";
import "./themes/styles.css"
// routing
import Routes from "./routes";

// defaultTheme
import themes from "./themes";

// project imports
import NavigationScroll from "./layout/NavigationScroll";
import StickyLanguageSwitcher from "./ui-component/StickyLanguageSwitcher";
import { cspNonce } from "./utils/cspNonce";

// MUI styles are injected at runtime; tag them with the CSP nonce so the
// policy needs no 'unsafe-inline'. prepend = the old <StyledEngineProvider injectFirst>.
const emotionCache = createCache({ key: "css", prepend: true, nonce: cspNonce });
// tss-react (used by mui-datatables) ignores the emotion CacheProvider and
// otherwise creates its own nonce-less "tss" cache, which the CSP blocks.
const tssCache = createCache({ key: "tss", nonce: cspNonce });

// ==============================|| APP ||============================== //

const App = () => {
  const customization = useSelector((state) => state.customization);
  const location = useLocation();
  const hideLanguageSwitcher = location.pathname.startsWith("/vehicle-status");

  return (
    <CacheProvider value={emotionCache}>
     <TssCacheProvider value={tssCache}>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          <Routes />
          {!hideLanguageSwitcher && <StickyLanguageSwitcher />}
        </NavigationScroll>
      </ThemeProvider>
     </TssCacheProvider>
    </CacheProvider>
  );
};

export default App;
