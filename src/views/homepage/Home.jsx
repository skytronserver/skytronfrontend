// import React from "react";
// import {
//   Typography,
//   Container,
//   Grid,
//   Paper,
//   TextField,
//   Button,
// } from "@mui/material";

// import skytronlogo from '../../assets/images/skytron-logo.png'
// function Home() {
//   return (
//     <Container sx={{ mt: 4 }}>
//       <Grid
//         container
//         spacing={3}
//         justifyContent="center"
//         alignItems="center"
//         sx={{ height: "70vh" }}
//       >
//         <Grid
//           item
//           xs={12}
//           md={8}
//           sx={{ display: { xs: "none", md: "block" } }}
//         ></Grid>
//         <Grid
//           item
//           xs={12}
//           md={4}
//           direction="row"
//           justifyContent="center"
//           alignItems="center"
//         >
//           <Paper
//             sx={{
//               p: 2,
//               backdropFilter: "blur(5px)",
//               backgroundColor: "rgba(255, 255, 255, 0.3)",
//               borderRadius: "8px",
//               boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
//             }}
//           >
//             <Typography variant="h6" gutterBottom align="center">
//             <img
//         src={skytronlogo}
//         alt="logo"
//         style={{ height: 'auto', width: '36px' }}
//       /><br/> SKYTRON
//             </Typography>
//             <form noValidate autoComplete="off">
//               <TextField
//                 id="username"
//                 label="Username"
//                 variant="outlined"
//                 fullWidth
//                 margin="normal"
//                 sx={{ backgroundColor: "none" }}
//               />
//               <TextField
//                 id="password"
//                 label="Password"
//                 variant="outlined"
//                 type="password"
//                 fullWidth
//                 margin="normal"
//               />
//               <Button variant="contained" color="primary" fullWidth>
//                 Login
//               </Button>
//             </form>
//           </Paper>
//         </Grid>
//       </Grid>
//     </Container>
//   );
// }

// export default Home;
import React from "react";
import {
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
} from "@mui/material";

import skytronlogo from '../../assets/images/skytron-logo.png'
function Home() {
  return (
    <Container sx={{ mt: 4 }}>
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ height: "70vh" }}
      >
        <Grid
          item
          xs={12}
          md={8}
          sx={{ display: { xs: "none", md: "block" } }}
        ></Grid>
        <Grid
          item
          xs={12}
          md={4}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
          <Paper
            sx={{
              p: 2,
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
            <img
        src={skytronlogo}
        alt="logo"
        style={{ height: 'auto', width: '36px' }}
      /><br/>
      {/* <span style={{ color: '#640D6B',fontFamily:'Quantico' }}>SKYTRON</span>    */}
      <span style={{color: "#430A5D", fontfamily:"Quantico",fontWeight:"900px",fontSize:"15px",textshadow: "2px 2px 4px"}}>SKYTRON</span>

            </Typography>
            <form noValidate autoComplete="off">
              <TextField
                id="username"
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ backgroundColor: "none" }}
              />
              <TextField
                id="password"
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
                margin="normal"
              />
              <Button variant="contained" color="primary" fullWidth>
                Login
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;