import React, { useState, useEffect } from "react";

import styled from "@emotion/styled";
import { Grid, Stack, Typography, Button } from "@mui/material";

import { format } from "date-fns";

import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";

const LandingGrid = styled(Grid)({
  display: "flex",
});

const ImgGrid = styled(Grid)({
  marginRight: "1em",
});

const ChampionshipGrid = styled(Grid)({});

export default function Index() {
  const { user } = useUser();

  const [championship, setChampionship] = useState({});
  const [participate, setParticipate] = useState(false);
  const addParticipate = () => {
    setParticipate(true);
    fetch(`/api/championship?userId=${championship.nextChampionship.id}`, {
      method: "PUT",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          email: user.email,
          participate: true,
        },
      ]),
    });
  };

  useEffect(() => {
    if (user) {
      fetch(`/api/user/championship?email=${user.email}`)
        .then((res) => res.json())
        .then((data) => {
          setChampionship(data);
          setParticipate(
            data.nextChampionship && data.nextChampionship.participate
          );
        });
    }
  }, [user]);

  return (
    <LandingGrid>
      {!user && <Grid>Vous n'êtes pas connecter.</Grid>}
      {user && (
        <ChampionshipGrid>
          <Stack spacing={3}>
            {!championship.id && (
              <Typography>Aucun championnat prévu</Typography>
            )}
            {championship.id && !championship.participate && (
              <Typography>
                Le championnat <b>{championship.name}</b> est en cours mais vous
                n'êtes pas inscrit.
              </Typography>
            )}
            {championship.id && championship.participate && (
              <Typography>
                Le championnat <b>{championship.name}</b> est en cours. <Link href='/gaming'>Participez</Link> !
              </Typography>
            )}
            {championship.nextChampionship && (
              <Typography>
                Le prochain championnat{" "}
                <b>{championship.nextChampionship.name}</b> débutera le{" "}
                {format(
                  new Date(championship.nextChampionship.begin),
                  "dd/MM/yyyy"
                )}
                .
                {!participate && (
                  <Button onClick={addParticipate}>Je participe</Button>
                )}
                {participate && "Vous êtes inscrit."}
              </Typography>
            )}
          </Stack>
        </ChampionshipGrid>
      )}
    </LandingGrid>
  );
}
