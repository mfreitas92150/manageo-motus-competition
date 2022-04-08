import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

// Create a theme instance.
const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      paper: "#151915",
      default: "#151915",
    },
    primary: {
      main: "#fff",
      dark: "#fff",
    },
    overrides: {
      MuiButton: {
        raisedPrimary: {
          color: "white",
        },
      },
    },
  },
  typography: {
    fontFamily: "Raleway, sans-serif",
    fontSize: 14,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "#77A48B",
          backdropFilter: "blur(5px)",
        },
      },
    },
  },
});

export default theme;
