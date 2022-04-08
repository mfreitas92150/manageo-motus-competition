import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";

import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";

import styled from "@emotion/styled";

import {
  Grid,
  CssBaseline,
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GamesIcon from "@mui/icons-material/Games";
import InsightsIcon from "@mui/icons-material/Insights";
import SettingsIcon from "@mui/icons-material/Settings";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import HomeIcon from "@mui/icons-material/Home";

import { UserProvider } from "@auth0/nextjs-auth0";

import Link from "next/link";

import theme from "../src/theme";
import createEmotionCache from "../src/createEmotionCache";
import UserGrid from "../component/_user";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#DAB14A",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MyApp({
  Component,
  emotionCache = clientSideEmotionCache,
  pageProps,
}) {
  const [state, setState] = React.useState({
    open: false,
    role: null,
    validate: false,
    page: null,
  });

  const handleDrawerOpen = () => {
    setState({
      ...state,
      open: true,
    });
  };

  const handleDrawerClose = () => {
    setState({
      ...state,
      open: false,
    });
  };

  return (
    <UserProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar position="fixed" open={state.open} color={"secondary"}>
              <Toolbar>
                <Grid
                  container
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{
                      marginRight: "36px",
                      ...(state.open && { display: "none" }),
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography
                    variant="h5"
                    noWrap
                    component="div"
                    onClick={() =>
                      setState({
                        ...state,
                        page: null,
                      })
                    }
                  >
                    <b>mMotus</b>
                  </Typography>
                  <UserGrid />
                </Grid>
              </Toolbar>
            </AppBar>
            <Drawer variant="permanent" open={state.open}>
              <DrawerHeader>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List>
                <Link href="/">
                  <ListItem button>
                    <ListItemIcon>
                      <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="mHome" />
                  </ListItem>
                </Link>
                <Link href="/gaming">
                  <ListItem button>
                    <ListItemIcon>
                      <GamesIcon />
                    </ListItemIcon>
                    <ListItemText primary="mGame" />
                  </ListItem>
                </Link>
                <ListItem
                  button
                  onClick={() =>
                    setState({
                      ...state,
                      page: "market",
                    })
                  }
                >
                  <ListItemIcon>
                    <LocalGroceryStoreIcon />
                  </ListItemIcon>
                  <ListItemText primary="mMarket" />
                </ListItem>
                <ListItem
                  button
                  onClick={() =>
                    setState({
                      ...state,
                      page: "ranking",
                    })
                  }
                >
                  <ListItemIcon>
                    <InsightsIcon />
                  </ListItemIcon>
                  <ListItemText primary="mLeague" />
                </ListItem>
              </List>
              <Divider />
              <Link href="/admin">
                <ListItem button>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Administration" />
                </ListItem>
              </Link>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <DrawerHeader />
              <Component {...pageProps} />
              {/* {!isAuthenticated && <Typography paragraph>
              Connectez vous <LoginIcon onClick={() => loginWithRedirect()} />
            </Typography>}
            {isAuthenticated && !state.validate && <Typography paragraph>
              Vous n'êtes pas validé par le maitre du jeux.
            </Typography>}
            {state.validate && !state.page && <Landing user={user} />}
            {state.validate && state.page === 'gaming' && <GamingHome user={user} />}
            {state.validate && state.page === 'market' && <Market user={user} />}
            {state.validate && state.page === 'ranking' && <Ranking />}
            {state.role === 'ADMIN' && state.page === 'admin' && <Admin />} */}
            </Box>
          </Box>
        </ThemeProvider>
      </CacheProvider>
    </UserProvider>
  );
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  emotionCache: PropTypes.object,
  pageProps: PropTypes.object.isRequired,
};
