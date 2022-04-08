import React, { useEffect, useState } from "react";
import { Grid, Stack, Typography, Button } from "@mui/material";

import { useUser } from "@auth0/nextjs-auth0";

import Gaming from "../component/gaming/Gaming";

export default function GamingHome() {
  const { user } = useUser();

  const [championship, setChampionship] = useState({});

  useEffect(() => {
    if (user) {
      fetch(`/api/user/championship?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setChampionship(data);
        });
    }
  }, [user]);
  return (
    <Grid>
      {!user && <Grid>Vous n'êtes pas connecter.</Grid>}
      {user && !championship.id && (
        <Typography>Aucun championnat prévu</Typography>
      )}
      {user && championship.id && !championship.participate && (
        <Typography>
          Le championnat <b>{championship.name}</b> est en cours mais vous
          n'êtes pas inscrit.
        </Typography>
      )}
      {user && championship.participate && (
        <Gaming user={user} championship={championship} />
      )}
    </Grid>
  );
}
