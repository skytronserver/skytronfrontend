import { useSelector } from "react-redux";
import { Suspense } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider, CircularProgress } from "@mui/material";
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
  // const apicall = async () => {
  //   const response = await fetch("https://api.gromed.in/api/EM/DEx/get-media/",{
  //     headers: {
  //       'Authorization': `Token c43e5631503ac48ab980b549ec1c74993e8ffe88`
  //     },
  //     method: "POST",
  //   });
  //   const data = await response.json();
  //   console.log(data);
  // }
  // apicall();
  const customization = useSelector((state) => state.customization);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <CssBaseline />
        <NavigationScroll>
          {/* <Suspense fallback={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <CircularProgress />
            </div>
          }> */}
            <Routes />
            <StickyLanguageSwitcher />
          {/* </Suspense> */}
        </NavigationScroll>
      </ThemeProvider>
    </StyledEngineProvider>
  );
};

export default App;
