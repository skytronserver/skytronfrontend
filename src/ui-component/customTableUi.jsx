import { createTheme } from "@mui/material/styles";

const tableTheme = createTheme({
  components: {
    MUIDataTable: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          overflow: "hidden",
        },
      },
    },

    MUIDataTableHeadCell: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a", // 🔥 premium dark navy
          color: "#ffffff",
          fontWeight: 600,
          fontSize: "13px",
          padding: "14px",
          letterSpacing: "0.5px",
          borderBottom: "2px solid #334155",
        },
      },
    },

    MUIDataTableBodyRow: {
      styleOverrides: {
        root: {
          transition: "all 0.2s ease",

          // ✅ alternate rows
          "&:nth-of-type(even)": {
            backgroundColor: "#f8fafc",
          },

          "&:nth-of-type(odd)": {
            backgroundColor: "#ffffff",
          },

          // ✅ hover effect
          "&:hover": {
            backgroundColor: "#e2e8f0",
            transform: "scale(1.001)",
          },
        },
      },
    },

    MUIDataTableBodyCell: {
      styleOverrides: {
        root: {
          padding: "14px",
          fontSize: "13px",
          borderBottom: "1px solid #e2e8f0",
        },
      },
    },

    MuiTableFooter: {
      styleOverrides: {
        root: {
          backgroundColor: "#f1f5f9",
        },
      },
    },
  },
});

export default tableTheme;