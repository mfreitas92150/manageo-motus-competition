import * as React from "react";

import { useUser } from "@auth0/nextjs-auth0";

import { Button, Grid, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

export default function UserGrid() {
  const { user } = useUser();

  return (
    <Grid>
      {!user && (
        <Button>
          <LoginIcon onClick={() => (window.location = "/api/auth/login")} />
        </Button>
      )}
      {user && user.email}
      {user && (
        <Button>
          <LogoutIcon onClick={() => (window.location = "/api/auth/logout")} />
        </Button>
      )}
    </Grid>
  );
}
