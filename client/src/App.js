import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GamesIcon from '@mui/icons-material/Games';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';

import { useAuth0 } from "@auth0/auth0-react";

import Admin from './Admin/Admin'
import GamingHome from './Gaming/GamingHome'
import Ranking from './Ranking'
import Landing from './Landing'
import { fontSize } from '@mui/system';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "#7E97C5",
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);

export default function MiniDrawer() {
  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: {
        paper: "#002D3E",
        default: "#002D3E"
      }
    },
    typography: {
      fontFamily: 'Raleway, sans-serif',
      fontSize: 14
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: "rgba(22, 28, 36, 0.5)",
            backdropFilter: "blur(5px)"
          }
        }
      },
      MuiAppBar: {
        
      }
    },

  });
  const [state, setState] = useState({
    open: false,
    role: null,
    validate: false,
    page: null
  });
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  useEffect(() => {
    if (isAuthenticated) {
      fetch(`/api/user?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => setState({
          open: false,
          role: data.role,
          validate: data.validate,
          page: null
        }));
    }
  }, [isAuthenticated, user])

  const handleDrawerOpen = () => {
    setState({
      ...state,
      open: true
    });
  };

  const handleDrawerClose = () => {
    setState({
      ...state,
      open: false
    });
  };

  return (<ThemeProvider theme={theme}>
    <Box sx={{ display: 'flex' }} >
      <CssBaseline />
      <AppBar position="fixed" open={state.open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: '36px',
              ...(state.open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            mMotus ({user && user.email})
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={state.open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {state.validate && <List>
          <ListItem button onClick={() => setState({
            ...state,
            page: "gaming"
          })}>
            <ListItemIcon><GamesIcon /></ListItemIcon>
            <ListItemText primary="Jeux" />
          </ListItem>
          <ListItem button onClick={() => setState({
            ...state,
            page: "ranking"
          })}>
            <ListItemIcon><InsightsIcon /></ListItemIcon>
            <ListItemText primary="Classement" />
          </ListItem>
        </List>}
        <Divider />
        {
          isAuthenticated && <>
            <ListItem button onClick={() => logout({ returnTo: window.location.origin })}>
              <ListItemIcon>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Déconnexion" />
            </ListItem>
          </>
        }
        {
          !isAuthenticated && <>
            <ListItem button onClick={() => loginWithRedirect()}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Connexion" />
            </ListItem>
          </>
        }
        {
          state.role === 'ADMIN' && <>
            <ListItem button onClick={() => setState({
              ...state,
              page: "admin"
            })}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Administration" />
            </ListItem>
          </>
        }
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {!isAuthenticated && <Typography paragraph>
          Connectez vous <LoginIcon onClick={() => loginWithRedirect()} />
        </Typography>}
        {isAuthenticated && !state.validate && <Typography paragraph>
          Vous n'êtes pas validé par le maitre du jeux.
        </Typography>}
        {state.validate && !state.page && <Landing />}
        {state.validate && state.page === 'gaming' && <GamingHome user={user} />}
        {state.validate && state.page === 'ranking' && <Ranking />}
        {state.role === 'ADMIN' && state.page === 'admin' && <Admin />}
      </Box>
    </Box>
  </ThemeProvider>
  );
}
